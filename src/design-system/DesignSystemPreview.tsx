import { useState, type ReactNode } from 'react'
import { Badge } from '../components/ui/Badge.tsx'
import { Button } from '../components/ui/Button.tsx'
import { Container } from '../components/ui/Container.tsx'
import { Divider } from '../components/ui/Divider.tsx'
import { Heading } from '../components/ui/Heading.tsx'
import { Row } from '../components/ui/Row.tsx'
import { Section } from '../components/ui/Section.tsx'
import { Stack } from '../components/ui/Stack.tsx'
import { Surface } from '../components/ui/Surface.tsx'
import { Text } from '../components/ui/Text.tsx'

/*
 * TEMPORARY INTERNAL VERIFICATION SURFACE — Phase 02 only.
 *
 * This is not a page and not the future homepage. It exists solely to prove that the design
 * system renders correctly (tokens, typography, surfaces, focus, motion, responsive, RTL).
 * It contains no portfolio content and no application logic, and it will be replaced by the
 * real pages in later phases.
 *
 * Class names are written as complete literals everywhere: Tailwind generates utilities from
 * source text, so dynamically built class strings would silently produce no CSS.
 */

const colorSwatches = [
  { label: 'background', className: 'bg-background' },
  { label: 'background-elevated', className: 'bg-background-elevated' },
  { label: 'background-subtle', className: 'bg-background-subtle' },
  { label: 'surface', className: 'bg-surface' },
  { label: 'surface-elevated', className: 'bg-surface-elevated' },
  { label: 'primary', className: 'bg-primary' },
  { label: 'primary-subtle', className: 'bg-primary-subtle' },
  { label: 'accent', className: 'bg-accent' },
  { label: 'success', className: 'bg-success' },
  { label: 'warning', className: 'bg-warning' },
  { label: 'error', className: 'bg-error' },
  { label: 'info', className: 'bg-info' },
  { label: 'border', className: 'bg-border' },
  { label: 'border-strong', className: 'bg-border-strong' },
  { label: 'focus', className: 'bg-focus' },
  { label: 'disabled', className: 'bg-disabled' },
]

const radiusSamples = [
  { label: 'rounded-xs', className: 'rounded-xs' },
  { label: 'rounded-sm', className: 'rounded-sm' },
  { label: 'rounded-md', className: 'rounded-md' },
  { label: 'rounded-lg', className: 'rounded-lg' },
  { label: 'rounded-xl', className: 'rounded-xl' },
  { label: 'rounded-2xl', className: 'rounded-2xl' },
]

const spacingSamples = [
  { label: 'h-2 / 0.5rem', className: 'h-2' },
  { label: 'h-3 / 0.75rem', className: 'h-3' },
  { label: 'h-4 / 1rem', className: 'h-4' },
  { label: 'h-6 / 1.5rem', className: 'h-6' },
  { label: 'h-8 / 2rem', className: 'h-8' },
]

const shadowSamples = [
  { label: 'shadow-soft', className: 'shadow-soft' },
  { label: 'shadow-elevated', className: 'shadow-elevated' },
  { label: 'shadow-glass', className: 'shadow-glass' },
  { label: 'shadow-glow', className: 'shadow-glow' },
]

function SectionFrame({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <Section spacing="sm">
      <Stack gap="md">
        <Stack gap="xs">
          <Heading level={3}>{title}</Heading>
          <Text variant="muted">{description}</Text>
        </Stack>
        {children}
      </Stack>
    </Section>
  )
}

export function DesignSystemPreview() {
  const [direction, setDirection] = useState<'ltr' | 'rtl'>('ltr')
  const isRtl = direction === 'rtl'

  return (
    <div dir={direction} lang={isRtl ? 'ar' : 'en'} className="min-h-dvh bg-background">
      <Container width="wide">
        <Section spacing="sm">
          <Stack gap="md">
            <Row justify="between" gap="md">
              <Stack gap="xs">
                <Text variant="label">Phase 02 · internal verification surface</Text>
                <Heading level={1}>Design system</Heading>
                <Text variant="muted">
                  Temporary surface used to verify tokens, typography, surfaces, focus, motion,
                  responsive behaviour and RTL. Not a page; contains no portfolio content.
                </Text>
              </Stack>
              <Row gap="sm" align="center">
                <Button
                  size="sm"
                  variant={isRtl ? 'outline' : 'primary'}
                  onClick={() => setDirection('ltr')}
                >
                  dir=ltr
                </Button>
                <Button
                  size="sm"
                  variant={isRtl ? 'primary' : 'outline'}
                  onClick={() => setDirection('rtl')}
                >
                  dir=rtl
                </Button>
              </Row>
            </Row>
            <Surface variant="outline" padding="sm">
              <Text variant="subtle">
                Current direction: {direction}. Layout uses logical properties only, so switching
                direction needs no component changes.
              </Text>
            </Surface>
          </Stack>
        </Section>

        <Divider />

        <SectionFrame
          title="Typography"
          description="One scale for headings, body, captions, labels and code. Arabic uses its own stack, leading and tracking."
        >
          <Stack gap="lg">
            <Stack gap="sm">
              <Text variant="label">Heading hierarchy</Text>
              <Heading level={1}>Heading level 1</Heading>
              <Heading level={2}>Heading level 2</Heading>
              <Heading level={3}>Heading level 3</Heading>
              <Heading level={4}>Heading level 4</Heading>
            </Stack>
            <Stack gap="sm">
              <Text variant="label">Body roles</Text>
              <Text variant="lead">Lead paragraph for introductions and section openers.</Text>
              <Text>Default body text for readable prose at a comfortable measure.</Text>
              <Text variant="muted">Muted body text for supporting information.</Text>
              <Text variant="subtle">Caption text for metadata and secondary detail.</Text>
              <Text variant="label">Label text</Text>
              <Text variant="code">const token = &apos;semantic, never raw&apos;</Text>
            </Stack>
            <Stack gap="sm">
              <Text variant="label">Arabic shaping and leading</Text>
              <Text as="p" lang="ar" dir="rtl" className="text-lead">
                نظام تصميم عربي يُحترم فيه تشكيل الحروف وارتفاع السطر، دون أي تقليص للتباعد.
              </Text>
            </Stack>
          </Stack>
        </SectionFrame>

        <Divider />

        <SectionFrame
          title="Colour tokens"
          description="Semantic roles only. Components never reference raw colour values."
        >
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
<SectionFrame
          title="Surfaces, depth and glass"
          description="Four surface variants and four shadow tokens. Glass is an intentional variant, never the default."
        >
          <Stack gap="lg">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Surface variant="default">
                <Stack gap="xs">
                  <Text variant="label">default</Text>
                  <Text variant="muted">Base panel on the page background.</Text>
                </Stack>
              </Surface>
              <Surface variant="elevated">
                <Stack gap="xs">
                  <Text variant="label">elevated</Text>
                  <Text variant="muted">Raised panel with the elevated shadow.</Text>
                </Stack>
              </Surface>
              <Surface variant="glass">
                <Stack gap="xs">
                  <Text variant="label">glass</Text>
                  <Text variant="muted">Translucent blurred layer.</Text>
                </Stack>
              </Surface>
              <Surface variant="outline">
                <Stack gap="xs">
                  <Text variant="label">outline</Text>
                  <Text variant="muted">Border only, no fill.</Text>
                </Stack>
              </Surface>
            </div>
            <div className="relative overflow-hidden rounded-xl bg-background-subtle p-6">
              <div
                className="pointer-events-none absolute start-6 top-6 h-40 w-40 rounded-full bg-primary/40 blur-3xl"
                aria-hidden="true"
              />
              <div
                className="pointer-events-none absolute end-10 bottom-4 h-32 w-32 rounded-full bg-accent/30 blur-3xl"
                aria-hidden="true"
              />
              <Surface variant="glass" className="relative">
                <Stack gap="xs">
                  <Text variant="label">glass contrast check</Text>
                  <Text>
                    Body text stays readable on a glass surface even where the decorative
                    background is at its brightest.
                  </Text>
                </Stack>
              </Surface>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {shadowSamples.map((shadow) => (
                <Surface key={shadow.label} variant="default">
                  <div className={`h-10 rounded-md bg-surface-elevated ${shadow.className}`} />
                  <Text variant="subtle" className="mt-3">
                    {shadow.label}
                  </Text>
                </Surface>
              ))}
            </div>
          </Stack>
        </SectionFrame>

        <Divider />
            {colorSwatches.map((swatch) => (
              <Stack key={swatch.label} gap="xs">
                <div
                  className={`h-12 rounded-md border border-border ${swatch.className}`}
                  aria-hidden="true"
                />
                <Text variant="subtle">{swatch.label}</Text>
              </Stack>
            ))}
          </div>
        </SectionFrame>

<SectionFrame
          title="Interactive states"
          description="Hover, active, focus-visible and disabled are defined once and shared by every variant."
        >
          <Stack gap="lg">
            <Stack gap="sm">
              <Text variant="label">Button variants</Text>
              <Row gap="sm">
                <Button variant="primary">Primary</Button>
                <Button variant="accent">Accent</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
              </Row>
            </Stack>
            <Stack gap="sm">
              <Text variant="label">Sizes — md and lg meet the 44px touch target</Text>
              <Row gap="sm">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
              </Row>
            </Stack>
            <Stack gap="sm">
              <Text variant="label">Disabled — stays visible and understandable</Text>
              <Row gap="sm">
                <Button disabled>Disabled primary</Button>
                <Button variant="outline" disabled>
                  Disabled outline
                </Button>
              </Row>
            </Stack>
            <Stack gap="sm">
              <Text variant="label">Badges</Text>
              <Row gap="sm">
                <Badge variant="neutral">Neutral</Badge>
                <Badge variant="primary">Primary</Badge>
                <Badge variant="accent">Accent</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="error">Error</Badge>
                <Badge variant="info">Info</Badge>
              </Row>
            </Stack>
          </Stack>
        </SectionFrame>

        <Divider />

        <SectionFrame
          title="Shape and spacing"
          description="Radii and spacing come from fixed scales so nothing drifts per component."
        >
          <Stack gap="lg">
            <Row gap="sm">
              {radiusSamples.map((radius) => (
                <Stack key={radius.label} gap="xs" className="items-center">
                  <div className={`h-16 w-16 bg-surface-elevated ${radius.className}`} />
                  <Text variant="subtle">{radius.label}</Text>
                </Stack>
              ))}
            </Row>
            <Stack gap="sm">
              {spacingSamples.map((space) => (
                <Row key={space.label} gap="sm">
                  <div className={`w-24 rounded-xs bg-accent ${space.className}`} />
                  <Text variant="subtle">{space.label}</Text>
                </Row>
              ))}
            </Stack>
          </Stack>
        </SectionFrame>

        <Divider />
        <Divider />
<SectionFrame
          title="Motion"
          description="One easing family and a fixed three-step duration scale. Reduced motion is honoured globally."
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <Surface variant="elevated" className="animate-rise">
              <Stack gap="xs">
                <Text variant="label">animate-rise</Text>
                <Text variant="muted">Entrance uses opacity plus a small vertical offset.</Text>
              </Stack>
            </Surface>
            <Surface
              variant="elevated"
              className="transition-standard hover:-translate-y-1 hover:shadow-glow"
            >
              <Stack gap="xs">
                <Text variant="label">hover elevation</Text>
                <Text variant="muted">
                  Hover me: transform and shadow use the shared transition contract.
                </Text>
              </Stack>
            </Surface>
            <Surface variant="elevated" className="animate-fade">
              <Stack gap="xs">
                <Text variant="label">animate-fade</Text>
                <Text variant="muted">Opacity-only entrance for content that should not move.</Text>
              </Stack>
            </Surface>
          </div>
          <Surface variant="outline" padding="sm" className="mt-4">
            <Text variant="subtle">
              Enable your operating system&apos;s reduce-motion setting: all animation and
              transition durations collapse, while every state change and focus ring still works.
            </Text>
          </Surface>
        </SectionFrame>

        <Divider />

        <SectionFrame
          title="Focus, RTL and responsive"
          description="Keyboard focus is always visible, direction is logical, and grids reflow by breakpoint."
        >
          <Stack gap="lg">
            <Row gap="sm">
              <Button variant="outline">Focusable button</Button>
              <a
                href="#focus-target"
                className="rounded-md px-3 py-2 text-body text-accent underline underline-offset-4"
              >
                Focusable link
              </a>
            </Row>
            <Surface variant="default" className="border-s-4 border-s-accent ps-4">
              <Stack gap="xs">
                <Text variant="label">Logical inline edges</Text>
                <Text variant="muted">
                  This panel uses border-s-4 and ps-4, so the accent edge sits on the inline-start
                  side and flips automatically in RTL without any direction-specific class.
                </Text>
              </Stack>
            </Surface>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <Surface variant="default">
                <Text variant="muted">1 column on mobile</Text>
              </Surface>
              <Surface variant="default">
                <Text variant="muted">2 columns from sm</Text>
              </Surface>
              <Surface variant="default">
                <Text variant="muted">3 columns from lg</Text>
              </Surface>
              <Surface variant="default">
                <Text variant="muted">4 columns from xl</Text>
              </Surface>
            </div>
          </Stack>
        </SectionFrame>

        <Divider />

        <Section spacing="sm">
          <Text variant="subtle">
            Temporary Phase 02 verification surface — replaced by real pages in later phases.
          </Text>
        </Section>
      </Container>
    </div>
  )
}