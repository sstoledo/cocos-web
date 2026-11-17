# SUNAT Fase 1 — Consulta RUC

**Objective:** autocompletar datos del cliente desde el padrón de SUNAT vía API Perú: escribir un RUC → razón social + dirección fiscal.
**Branches:** `feat/sunat-fase1` in cocos-web and cocos-back.
**Delivery:** ask-on-risk. **Tests:** backend jest, frontend vitest.
**Provider:** ApiPeru (`POST https://api.apiperu.pe/ruc`, Bearer `APIPERU_TOKEN`). Chosen by user over FacilRUC (unreliable scraper) and ElRUC.pe (overkill for now).

## Specs

- **S1** — Backend proxy: `GET /api/sunat/ruc/:ruc` returns `{ ruc, razonSocial, direccion, estado, condicion }` for a valid RUC. Token only in backend (`APIPERU_TOKEN` env). Roles: Admin + Reception (client creators). RUC validated with the existing modulo-11 validator before any external call.
- **S2** — Errors: 404 "RUC no encontrado en el padrón de SUNAT" when the provider reports not found; 502 when the upstream is unavailable/invalid response; 503 "La consulta RUC no está configurada" when `APIPERU_TOKEN` is absent. Non-blocking for client creation either way.
- **S3** — Frontend autofill in ClientForm: when `identificationType` is RUC and the identification is a valid 11-digit RUC (debounced), call the backend and fill `name` and `address` **only if the field is empty** — never clobber user input. On found, show a hint with estado/condición; on not found or failure, show a hint and let the user continue.

## Tasks

| ID | Spec | Route | Status | Commit |
|----|------|-------|--------|--------|
| T1 | S1, S2 | inline (cocos-back) | done | 2958515 |
| T2 | S3 | inline (cocos-web) | done | 6d03754 |

## Log

- **L1** (2026-11-17) — User: "listo, mergeados, sigue con la fase 1" — authorizing Fase 1 as scoped by the roadmap ("Consulta RUC: autocompletar cliente") and S1–S3 above.
- **L2** (2026-11-17) — Provider endpoint verified live: `POST https://api.apiperu.pe/ruc` → 401 "Token requerido" without auth; `api.apiperu.dev/ruc` mirrors. Success shape from docs: `{ success, code, data: { ruc, nombre_o_razon_social, estado, condicion, direccion } }`.
