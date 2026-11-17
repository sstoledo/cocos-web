# SUNAT Fase 0 — Cimientos fiscales

**Objective:** fiscal foundations for SUNAT e-invoicing: real identification validation, issuer configuration, and additive fiscal fields on Sale. No external SUNAT/OSE calls in this phase.
**Branches:** `feat/sunat-fase0` in cocos-web and cocos-back.
**Delivery:** ask-on-risk. **Tests:** backend jest (`pnpm test` in cocos-back), frontend vitest (`pnpm test` in cocos-web).
**Covers both repos:** backend files live in `../cocos-back`, frontend in this repo.

## Specs

- **S1** — "Validación real de identificationType": DNI (8 dígitos), RUC (11 dígitos con algoritmo de dígito verificador y prefijos válidos 10/15/16/17/20). Backend validator `IsValidIdentification` and frontend zod `clientSchema` must reject RUCs that pass today's length-only check (e.g. `12345678901`).
- **S2** — "Config de emisor: RUC de la empresa, razón social, dirección, series y correlativos por tipo de comprobante". Stored server-side, editable via API and a settings UI. RUC validated with the same algorithm as S1.
- **S3** — "Extender Sale con campos fiscales: tipo de documento (01 Factura / 03 Boleta), serie, correlativo, estado de envío (pendiente/aceptado/rechazado) — todo additive". Fiscal serie/correlativo are assigned at emission time (Fase 2), not at sale creation. Assumption recorded: documentType selection at sale time is NOT part of this phase unless requested.

## Tasks

| ID | Spec | Route | Status | Commit |
|----|------|-------|--------|--------|
| T1 | S1 | inline (cocos-back) | done | fe3d04d |
| T2 | S1 | inline (cocos-web) | done | 4adbb31 |
| T3 | S2 | inline (cocos-back) | done | c724bc5 |
| T4 | S2 | inline (cocos-web) | done | 5002dfc |
| T5 | S3 | inline (cocos-back) | done | 9526382 |

## Log

- **L1** (2026-11-16) — User: "Vamos a enfocarnos ahora en una integracion con la Sunat". Assistant proposed 5-phase roadmap; user: "Si, vamos por tu sugerencia, empezamos fase 0" — authorizing Fase 0 as specified in S1–S3 above.
- **L2** (2026-11-16) — Exploration: `IsValidIdentification` (cocos-back `src/clients/validators/identification.validator.ts`) checks length only; frontend `client-schema.ts` same. No Company/Settings model exists. `SaleNumberSequence` (year-based) is the numbering precedent. Backend `main` at `7dd2519`, clean.
- **L3** (2026-11-17) — All 5 tasks done. T1 `fe3d04d` (backend RUC algo, RED→GREEN 2 failing→34/34), T2 `4adbb31` (frontend zod + `src/lib/ruc.ts`, suite 1564), T3 `c724bc5` (`CompanySettings` + GET/PATCH `/api/settings/company`, admin-only; RED observed via missing-module run), T4 `5002dfc` (settings page + sidebar "Configuración→Empresa"), T5 `9526382` (`FiscalDocumentType`/`SunatEmissionStatus` enums + nullable fiscal columns on `sales`, `sunat_status` default `pending`). Decision: correlativo counters deferred to Fase 2 (storing counters without emission creates dead data). Verification: backend 788/788, frontend 1564/1564, fresh-migration deploy on scratch DB verified (4 fiscal cols in sales, 4 in company_settings), scratch dropped.
- **L4** (2026-11-17) — Known consequence (Risk item 1 adjacent): clients saved before T1 with an invalid RUC (e.g. `12345678901`) will now fail form validation when edited; they must be corrected to a valid RUC at edit time. Not a data migration — no existing rows touched.
