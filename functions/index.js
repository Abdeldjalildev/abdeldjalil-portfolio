const crypto = require('node:crypto')
const { initializeApp } = require('firebase-admin/app')
const { getFirestore, FieldValue, Timestamp } = require('firebase-admin/firestore')
const { HttpsError, onCall } = require('firebase-functions/v2/https')
const { onSchedule } = require('firebase-functions/v2/scheduler')
const { setGlobalOptions } = require('firebase-functions/v2')

initializeApp()

setGlobalOptions({
  region: 'us-central1',
  maxInstances: 3,
  timeoutSeconds: 10,
  memory: '256MiB',
})

const db = getFirestore()

const EVENTS = new Set([
  'page_view',
  'project_view',
  'project_live_demo_click',
  'github_click',
  'contact_click',
  'social_click',
  'service_view',
  'resume_download',
])

const MAX_EVENTS_PER_VISITOR_PER_DAY = 100
const MAX_PATH_ENTRIES_PER_DAY = 50
const RETENTION_DAYS = 90

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function cleanPath(value) {
  if (typeof value !== 'string') return null
  const path = value.trim()
  if (!path || path.length > 200 || !path.startsWith('/')) return null
  return path
}

function cleanDimension(value) {
  if (typeof value !== 'string') return null
  const normalized = value.trim()
  if (!normalized || normalized.length > 120 || !/^[A-Za-z0-9._-]+$/.test(normalized)) return null
  return normalized
}

function hashVisitorId(visitorId) {
  return crypto.createHash('sha256').update(visitorId).digest('hex')
}

function dateKey(now) {
  return now.toISOString().slice(0, 10)
}

function expirationFor(now, days) {
  const expires = new Date(now.getTime())
  expires.setUTCDate(expires.getUTCDate() + days)
  return Timestamp.fromDate(expires)
}

exports.recordAnalyticsEvent = onCall({ enforceAppCheck: true }, async request => {
  const data = request.data
  if (!isPlainObject(data)) {
    throw new HttpsError('invalid-argument', 'Invalid analytics payload.')
  }

  const allowedKeys = new Set(['event', 'visitorId', 'path', 'projectId', 'serviceId'])
  if (Object.keys(data).some(key => !allowedKeys.has(key))) {
    throw new HttpsError('invalid-argument', 'Unexpected analytics field.')
  }

  const eventName = data.event
  const visitorId = data.visitorId

  if (typeof eventName !== 'string' || !EVENTS.has(eventName)) {
    throw new HttpsError('invalid-argument', 'Unsupported analytics event.')
  }

  if (
    typeof visitorId !== 'string' ||
    visitorId.length < 16 ||
    visitorId.length > 100 ||
    !/^[A-Za-z0-9_-]+$/.test(visitorId)
  ) {
    throw new HttpsError('invalid-argument', 'Invalid visitor identifier.')
  }

  const path = cleanPath(data.path)
  const projectId = cleanDimension(data.projectId)
  const serviceId = cleanDimension(data.serviceId)

  if (eventName === 'page_view' && !path) {
    throw new HttpsError('invalid-argument', 'Page views require a path.')
  }

  if (eventName === 'project_view' && !projectId) {
    throw new HttpsError('invalid-argument', 'Project views require a project identifier.')
  }

  if (eventName === 'service_view' && !serviceId) {
    throw new HttpsError('invalid-argument', 'Service views require a service identifier.')
  }

  const now = new Date()
  const day = dateKey(now)
  const visitorHash = hashVisitorId(visitorId)
  const dailyRef = db.collection('analyticsDaily').doc(day)
  const visitorRef = db.collection('analyticsVisitors').doc(`${day}_${visitorHash}`)

  await db.runTransaction(async transaction => {
    const dailySnapshot = await transaction.get(dailyRef)
    const visitorSnapshot = await transaction.get(visitorRef)

    const visitorData = visitorSnapshot.exists ? visitorSnapshot.data() : {}
    const previousCount = Number(visitorData.eventCount ?? 0)
    if (previousCount >= MAX_EVENTS_PER_VISITOR_PER_DAY) {
      throw new HttpsError('resource-exhausted', 'Daily analytics limit reached.')
    }

    const seenEvents = isPlainObject(visitorData.events) ? visitorData.events : {}
    const firstVisitForDay = !visitorSnapshot.exists

    const dailyData = dailySnapshot.exists ? dailySnapshot.data() : {}
    const eventCounts = isPlainObject(dailyData.eventCounts) ? dailyData.eventCounts : {}
    const pathCounts = isPlainObject(dailyData.pathCounts) ? dailyData.pathCounts : {}
    const serviceCounts = isPlainObject(dailyData.serviceCounts) ? dailyData.serviceCounts : {}
    const projectCounts = isPlainObject(dailyData.projectCounts) ? dailyData.projectCounts : {}

    const nextEventCounts = {
      ...eventCounts,
      [eventName]: Number(eventCounts[eventName] ?? 0) + 1,
    }

    const nextPathCounts = { ...pathCounts }
    if (eventName === 'page_view' && path) {
      const pathKey = Buffer.from(path).toString('base64url')
      if (Object.prototype.hasOwnProperty.call(nextPathCounts, pathKey) || Object.keys(nextPathCounts).length < MAX_PATH_ENTRIES_PER_DAY) {
        nextPathCounts[pathKey] = Number(nextPathCounts[pathKey] ?? 0) + 1
      }
    }

    const nextServiceCounts = { ...serviceCounts }
    if (eventName === 'service_view' && serviceId) {
      nextServiceCounts[serviceId] = Number(nextServiceCounts[serviceId] ?? 0) + 1
    }

    const nextProjectCounts = { ...projectCounts }
    if (eventName === 'project_view' && projectId) {
      nextProjectCounts[projectId] = Number(nextProjectCounts[projectId] ?? 0) + 1
    }

    transaction.set(
      dailyRef,
      {
        eventCounts: nextEventCounts,
        pathCounts: nextPathCounts,
        serviceCounts: nextServiceCounts,
        projectCounts: nextProjectCounts,
        uniqueVisitors: Number(dailyData.uniqueVisitors ?? 0) + (firstVisitForDay ? 1 : 0),
        updatedAt: FieldValue.serverTimestamp(),
        expiresAt: expirationFor(now, RETENTION_DAYS),
      },
      { merge: true },
    )

    transaction.set(
      visitorRef,
      {
        events: { ...seenEvents, [eventName]: true },
        eventCount: previousCount + 1,
        updatedAt: FieldValue.serverTimestamp(),
        expiresAt: expirationFor(now, RETENTION_DAYS),
      },
      { merge: true },
    )
  })

  return { accepted: true }
})


const RETENTION_DELETE_BATCH_SIZE = 450
const RETENTION_MAX_BATCHES_PER_RUN = 5

exports.pruneAnalytics = onSchedule('every 24 hours', async () => {
  const now = Timestamp.now()
  const collections = ['analyticsDaily', 'analyticsVisitors']

  for (const collectionName of collections) {
    for (let batchNumber = 0; batchNumber < RETENTION_MAX_BATCHES_PER_RUN; batchNumber += 1) {
      const snapshot = await db.collection(collectionName)
        .where('expiresAt', '<=', now)
        .limit(RETENTION_DELETE_BATCH_SIZE)
        .get()

      if (snapshot.empty) break

      const batch = db.batch()
      snapshot.docs.forEach(snapshotDoc => batch.delete(snapshotDoc.ref))
      await batch.commit()

      if (snapshot.size < RETENTION_DELETE_BATCH_SIZE) break
    }
  }
})
