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
| T3 | S2 | inline (cocos-back) | pending | |
| T4 | S2 | inline (cocos-web) | pending | |
| T5 | S3 | inline (cocos-back) | pending | |

## Log

- **L1** (2026-11-16) — User: "Vamos a enfocarnos ahora en una integracion con la Sunat". Assistant proposed 5-phase roadmap; user: "Si, vamos por tu sugerencia, empezamos fase 0" — authorizing Fase 0 as specified in S1–S3 above.
- **L2** (2026-11-16) — Exploration: `IsValidIdentification` (cocos-back `src/clients/validators/identification.validator.ts`) checks length only; frontend `client-schema.ts` same. No Company/Settings model exists. `SaleNumberSequence` (year-based) is the numbering precedent. Backend `main` at `7dd2519`, clean.
