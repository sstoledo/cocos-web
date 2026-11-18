# SUNAT Fase 2 — Emisión de CPE (SEE directo)

**Objective:** emit legal boletas (03) and facturas (01) directly to SUNAT's SEE billService: UBL 2.1 generation, XMLDSig signing, ZIP, SOAP WS-Security, CDR parsing, fiscal numbering, sale state updates, UI emission action.
**Branches:** `feat/sunat-fase2` in cocos-web and cocos-back.
**Delivery:** single-pr per repo (established phase pattern), work-unit commits inside.
**Tests:** backend jest (offline: golden XML fixtures, mocked SOAP; never live SUNAT calls), frontend vitest.
**Gate decision (user):** SEE directo a SUNAT — no per-document cost; requires business-side digital certificate + SOL credentials + SUNAT homologación.

## Specs

- **S1** — "Generamos y firmamos el XML UBL 2.1 nosotros y enviamos por SOAP a SUNAT con credenciales SOL." Boleta (03) and Factura (01) emission for completed sales, per SUNAT billService (beta by default, prod via config).
- **S2** — Fiscal serie/correlativo are assigned at emission time from `CompanySettings` series (F001/B001), through a per-serie sequence table (same pattern as `SaleNumberSequence`); correlated per SUNAT rules (1..99999999 per serie).
- **S3** — Emission endpoint `POST /api/sales/:id/emit` (Admin + Reception): assigns fiscal numbering, builds + signs + zips the XML, sends to billService, parses the CDR, and updates the sale (`fiscalSeries`, `fiscalNumber`, `documentType`, `sunatStatus` accepted/observed/rejected). Unconfigured env (missing cert/SOL) → 503 with a clear message; emission failures never mutate the sale's stock/totals.
- **S4** — UI: emit action on SaleDetailPage showing SUNAT status; the emitted CPE is printable (representation impresa) via the existing detail as a print view. Assumption: dedicated PDF generation is NOT part of this phase (browser print), recorded unless requested otherwise.
- **S5** — Config via env: `SUNAT_BILL_SERVICE_URL` (default beta), `SUNAT_SOL_USER`, `SUNAT_SOL_PASSWORD`, `SUNAT_CERT_PATH` (+ optional `SUNAT_CERT_PASSWORD`). No secrets in code or committed fixtures.

## Tasks

| ID | Spec | Route | Status | Commit |
|----|------|-------|--------|--------|
| T1 | S2 | inline (cocos-back) | done | cd18a6e |
| T2 | S1 | inline (cocos-back) | done | 6a35e08 |
| T3 | S1 | inline (cocos-back) | done | f333629 |
| T4 | S1 | inline (cocos-back) | done | 8b72eb5 |
| T5 | S1, S3 | inline (cocos-back) | done | dd348a7 |
| T6 | S3 | inline (cocos-back) | done | d654ba8, 25383dd |
| T7 | S4 | inline (cocos-web) | done | 5f74d46, 1b38803, 4e44ed4 |

Commit hashes above are from the branch rebuilt on `origin/main` (backend `1d1da5d..25383dd`, frontend `5f74d46..4e44ed4`); the pre-rebuild hashes in L3–L4 history are obsolete.

## Log

- **L1** (2026-11-17) — User: "seguimos con la fase 2"; gate answer: "SEE directo a SUNAT" (over OSE/NubeFacT and postponing). Scope = S1–S5 above.
- **L2** (2026-11-17) — Research: SUNAT billService endpoints beta `https://e-factura-test.sunat.gob.pe/ol-ti-itcpfegem/billService` / prod `https://e-factura.sunat.gob.pe/ol-ti-itcpfegem/billService`; WS-Security UsernameToken with SOL credentials; CDR is a ZIP containing `R-<serie-correlativo>.xml` with ResponseCode (0 accepted). New deps: `xml-crypto` (XMLDSig), `fast-xml-parser` (CDR), `jszip` (zip/CDR).
- **L3** (2026-11-18) — Implementation decisions recorded during Fase 2:
  - Added `SUNAT_CERT_KEY_PATH` next to `SUNAT_CERT_PATH` (S5 extension): the digital certificate arrives as two PEM files (cert + key). `SUNAT_CERT_PASSWORD` unlocks a passphrase-protected key via `crypto.createPrivateKey`. Documented in `.env.template`.
  - Per-line amounts: sale prices are IGV-inclusive; each line's taxable base and IGV are derived (`base = round2(total / 1.18)`), and document totals are the sum of line amounts so SUNAT's cross-check passes.
  - Fiscal numbering (`FiscalNumberSequence`) is reserved before the SOAP call and consumed on transport failure (documented in the service). Reusing a number with different content is rejected by SUNAT (code 2385); a resend of identical content is safe.
  - Buyer rules: any emission requires the client to have an identification document; facturas require the client RUC. Boleta with DNI is allowed.
  - CDR: `ResponseCode` 0 = accepted, anything else = rejected with SUNAT's `Description` surfaced verbatim to the UI.
  - `SaleResponseDto` now exposes `documentType`, `fiscalSeries`, `fiscalNumber`, `sunatStatus` (additive contract).
  - Representation impresa = browser print of the sale detail (explicit `Imprimir` action), no PDF library.
- **L4** (2026-11-18) — Verification: backend 69 suites / 835 tests green (47 in `src/sunat`); frontend 318 files / 1581 tests green. Signer tests use a committed self-signed test fixture (`src/sunat/__fixtures__`); no live SUNAT calls anywhere in the suite.
- **L5** (2026-11-18) — Business prerequisites before real emission (outside code): SUNAT digital certificate (issued against the company RUC), SOL secondary user credentials with emission permission, and the homologación process in SUNAT's SEE QA environment. `SUNAT_BILL_SERVICE_URL` stays on beta until production access is granted.
- **L6** (2026-11-18) — Delivery: both PRs rebuilt on current `origin/main` and green. cocos-back #115 (8 commits, 27 files, +1868): Lint/typecheck/build, Jest, Testcontainers all pass. cocos-web #171 (3 commits, 11 files, +461): Lint/typecheck/unit/build pass and Playwright e2e passes (11m51s). Both assigned to `sstoledo` and `MERGEABLE`. Backend PR title corrected from the stray chore headline to `feat: SUNAT CPE emission via SEE directo (UBL 2.1 + XMLDSig + billService)`.
