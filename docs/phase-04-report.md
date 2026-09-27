# RETROSPECTIVE HISTORICAL EVIDENCE RECONSTRUCTION — Phase 04
## 1. Reconstruction Scope
Retrospective reconstruction of Authentication, Admin Identity & Authorization, explicitly separating original implementation from later auth hardening.
## 2. Current Verification Status
**No local/runtime verification has yet been performed by the owner for this phase.**
## 3. Historical Timeline
- `a60b61c30b73c25cdd457ac27294c3e16088d43c` — Phase 04 contract.
- `a4f8f319e8c83a1289daa63e4b21f143b463ea21` — original AuthProvider/admin-boundary foundation.
- `7b459e83f0f90ce3d9cf8cc5517ea35135f2961f` — later auth audit identifying two defects.
- `aecc5bd5862f07abe95f8e66dc11e2e0764bd90b` — later auth hardening.
- `4a8b9d02c0826424711eb38e110850ec9673ae87`, `3c8fb94d11c6e9533489cb31db11fc9bbd403586` — later Phase 04 harness addition/registration.
- `c8fcb30c249602890107623474bac4b2d2f875b2` — later repair-sequence verification-contract adjustment.
## 4. Phase Objective
AGENTS.md requires trustworthy Firebase Auth identity, trusted admin claims, protected operations and server-authoritative authorization.
## 5. Gate 1 — Discovery / Contract
**E3.** AGENTS.md explicitly defines identity/trust boundaries; `scripts/provision-admin.mjs` provides repository evidence of privileged claim provisioning. Formal discovery review is unavailable.
## 6. Gate 2 — Architecture / Data Design
**E3.** AuthProvider/context/types, AdminAccessBoundary and Firebase initialization provide direct architecture evidence. Client session state is separated from server authorization.
## 7. Gate 3 — Implementation
**E3.** Original auth implementation is traceable to the foundation commit. Later audit found: refetch claim-read failure was not fail-closed; stale async auth results could overwrite newer state. Later repair added monotonic request generation, fail-closed refresh behavior and current-user UID matching. These repairs do not rewrite the original history.
## 8. Gate 4 — Verification
**E0 for historical execution; E3 for later harness existence.** A Phase 04 harness now exists, but no execution record proving PASS was found.
**Historical verification evidence unavailable.**
**Current local/runtime verification not yet performed by owner.**
## 9. Gate 5 — Hardening / Review
**E3 for later hardening; E0 for original Gate 5 execution.** Later audit/repair directly addresses the two auth lifecycle defects and preserves server-side authorization. This is later evidence, not proof of original hardening completion.
## 10. Gate 6 — Closure / Evidence
**E0. FORMAL CLOSURE NOT HISTORICALLY PROVEN.**
## 11. Evidence Classification
**PARTIALLY RECONSTRUCTIBLE.** Implementation and defect/repair chronology are strong; execution/closure are missing.
## 12. Historical Defects / Gaps
Original claim-refresh failure handling and stale-result race were later discovered. Historical auth execution evidence is unavailable.
## 13. Later Repairs
`aecc5bd5862f07abe95f8e66dc11e2e0764bd90b`; `4a8b9d02...`; `3c8fb94...`; `c8fcb30...` — all later repairs/harness work, not original evidence.
## 14. Current-State Consistency
Current repair tracker treats the auth findings as repository-level repairs still requiring runtime verification; AGENTS.md retains owner-controlled closure.
## 15. Unavailable Evidence
Historical sign-in, token/claim refresh, claim revocation, emulator/browser execution, owner acceptance and closure evidence.
## 16. Formal Closure Status
**NOT CLOSED.**
## 17. Exact Git/Repository References
`a60b61c...`; `a4f8f319e8c83a1289daa63e4b21f143b463ea21`; `7b459e83f0f90ce3d9cf8cc5517ea35135f2961f`; `aecc5bd5862f07abe95f8e66dc11e2e0764bd90b`; `4a8b9d02c0826424711eb38e110850ec9673ae87`; `3c8fb94d11c6e9533489cb31db11fc9bbd403586`; `c8fcb30c249602890107623474bac4b2d2f875b2`; `src/auth/AuthProvider.tsx`; `src/routes/AdminAccessBoundary.tsx`; `scripts/provision-admin.mjs`.
