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
| T1 | S2 | inline (cocos-back) | pending | |
| T2 | S1 | inline (cocos-back) | pending | |
| T3 | S1 | inline (cocos-back) | pending | |
| T4 | S1 | inline (cocos-back) | pending | |
| T5 | S1, S3 | inline (cocos-back) | pending | |
| T6 | S3 | inline (cocos-back) | pending | |
| T7 | S4 | inline (cocos-web) | pending | |

## Log

- **L1** (2026-11-17) — User: "seguimos con la fase 2"; gate answer: "SEE directo a SUNAT" (over OSE/NubeFacT and postponing). Scope = S1–S5 above.
- **L2** (2026-11-17) — Research: SUNAT billService endpoints beta `https://e-factura-test.sunat.gob.pe/ol-ti-itcpfegem/billService` / prod `https://e-factura.sunat.gob.pe/ol-ti-itcpfegem/billService`; WS-Security UsernameToken with SOL credentials; CDR is a ZIP containing `R-<serie-correlativo>.xml` with ResponseCode (0 accepted). New deps: `xml-crypto` (XMLDSig), `fast-xml-parser` (CDR), `jszip` (zip/CDR).
