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
- **S6** — "El XML de nuestro CPE debe validar contra el esquema UBL 2.1 oficial." Verified offline against the OASIS schemas (L9); guarded by tests on the structural invariants that the four original defects broke.
- **S7** — Domicilio fiscal del emisor: `CompanySettings` stores **only the 6-digit INEI ubigeo**; the XML emits `cac:RegistrationAddress` inside `cac:PartyLegalEntity` with `cbc:ID` = ubigeo, `cbc:AddressTypeCode` = `0000`, `cbc:CityName`/`cbc:CountrySubentity`/`cbc:District` derived from the catalog (province/department/district), and `cac:AddressLine/cbc:Line` with the configured address. Derived names are never stored, so they cannot contradict the code. The INEI catalog (1874 districts) is vendored in the backend and exposed as `GET /api/ubigeos?query=&limit=`; the UI chooses with a searchable combobox. Emission is blocked when the ubigeo is missing or not in the catalog.
- **S8** — CPE structure aligned with a real accepted CPE (`Factura-Gravada.xml`): `cbc:InvoiceTypeCode listID="0101"`, `cbc:IssueTime`, `cac:Signature/cbc:ID` = issuer RUC, `cac:PaymentTerms` (`FormaPago`/`Contado`), `cac:TaxScheme` = `1000`/`IGV`/`VAT`, `cbc:TaxExemptionReasonCode` (`10`) per line, and `cac:PricingReference/AlternativeConditionPrice` with `PriceTypeCode` `01`. Assumption: every line is a gravada cash- payment operation (the current sale model has no credit terms and all prices are IGV-inclusive); revisit when credit sales or exonerated items exist.

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
| T8 | S6 | inline (cocos-back) | done | c1940a3 |
| T9 | S7 | inline (cocos-back) | done | cfe0516 |
| T10 | S7 | inline (cocos-back) | done | 7cec678 |
| T11 | S8 | inline (cocos-back) | done | dea3bfe |
| T12 | S7 | inline (cocos-web) | done | 6df4574, 97e4a78 |
| T13 | S6-S8 | inline | done | L10 |

Commit hashes above are from the branch rebuilt on `origin/main` (backend `1d1da5d..25383dd`, frontend `5f74d46..4e44ed4`); the pre-rebuild hashes in L3–L4 history are obsolete.

## Log

- **L1** (2026-11-17) — User: "seguimos con la fase 2"; gate answer: "SEE directo a SUNAT" (over OSE/NubeFacT and postponing). Scope = S1–S5 above.
- **L2** (2026-11-17) — Research: SUNAT billService endpoints beta `<CORREGIDO en L7>` / prod `https://e-factura.sunat.gob.pe/ol-ti-itcpfegem/billService`; WS-Security UsernameToken with SOL credentials; CDR is a ZIP containing `R-<serie-correlativo>.xml` with ResponseCode (0 accepted). New deps: `xml-crypto` (XMLDSig), `fast-xml-parser` (CDR), `jszip` (zip/CDR).
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
- **L7** (2026-11-19) — **Defecto de borde corregido** (cocos-back `53a2bfe`). El cliente SOAP salió con la configuración equivocada y CI no podía detectarlo porque los tests mockean `fetch` contra la misma URL inexistente. Verificado contra SUNAT:
  - `DEFAULT_BILL_SERVICE_URL` y `SUNAT_BILL_SERVICE_URL` apuntaban a `e-factura-test.sunat.gob.pe`, que **no responde** (curl 28, sin handshake TLS). Se elimina la constante muerta (el cliente ya exigía la URL por config) y `.env.template` pasa a `https://e-beta.sunat.gob.pe/ol-ti-itcpfegem-beta/billService`, confirmado vivo: WSDL 200, certificado `CN=*.sunat.gob.pe`, y ese es el `soap:address` que declara el propio WSDL.
  - `BILL_SERVICE_NAMESPACE` usaba `http://service.sunat.gob.pe/bill/fecore/services/ws/billconsultservice` — el namespace del servicio de **consulta**. Corregido a `http://service.sunat.gob.pe`, que es el que usa la operación en el WSDL de billService.
  - `SOAPAction` pasa de vacío a `urn:sendBill`, como declara el WSDL.
  - Guardas añadidas: el test fija namespace y `SOAPAction`, y otro test lee `.env.template` y falla si la URL de beta deja de ser la vigente.
  - **Mapa de ambientes corregido** (antes se asumían dos): beta pública (`e-beta`, auth `[RUC]MODDATOS`/`MODDATOS`, sin certificado registrado, solo estructura XML de factura/boleta/NC/ND, **no autentica credenciales**), homologación SQA (`www.sunat.gob.pe/ol-ti-itcpgem-sqa/billService`, exige usuario SOL secundario real con perfil y certificado real) y producción. Beta no cubre resúmenes diarios ni bajas, así que Fase 4 se validará en homologación SQA.
  - Sonda manual a beta con un XML de juguete: devuelve 500 con eco del request y `X-Backside-Transport: FAIL FAIL` (el gateway no llega al backend). Conclusión: la validación real exige un CPE firmado por nuestro pipeline, no un stub — es el "anillo 1" pendiente.
- **L8** (2026-11-19) — **Anillo 1 ejecutado contra SUNAT real; Fase 2 NO está validada end-to-end.** Con el código compilado se envió un CPE firmado (emisor `20000000001`, credenciales `20000000001MODDATOS`/`MODDATOS`, certificado autofirmado de `__fixtures__`) a `e-beta`.
  - **Hallazgo 3, corregido** (`1863b6b`): el paquete viajaba como `F001-1.xml.zip`. El Manual del Programador exige `<RUC>-<tipo>-<serie>-<correlativo>` tanto para el ZIP como para el XML interno (ej. `20100066603-01-F001-1.ZIP`). Ahora se emite `20131312955-03-B001-1.zip` / `.xml`. RED→GREEN con 2 tests actualizados.
  - **Bloqueo externo**: beta devuelve `HTTP 500` con el request **ecoado** (1053 B = nuestro propio sobre) y `X-Backside-Transport: FAIL FAIL` en 5/5 reintentos espaciados. El gateway no alcanza su backend.
  - **El borde es correcto**: un único intento devolvió `401` con `SOAPAction: urn:sendBill`, mientras que con `SOAPAction` vacío siempre fue 500 — confirma que el ruteo depende de ese header y que el fix de L7 era necesario.
  - **Discriminador**: el mismo sobre enviado a **producción** con payload inválido devuelve un SOAP Fault estructurado (`env:Client` / `Internal Error (from client)`), no un eco. Es decir, nuestra red llega y SUNAT parsea el sobre; el fallo es específico del ambiente beta.
  - **Consecuencia**: no se puede afirmar que SUNAT acepte nuestros CPE. Queda pendiente (a) reintentar beta cuando su backend responda, (b) validar el XML contra los XSD oficiales offline —no requiere credenciales— antes de gastar más intentos.
- **L9** (2026-11-19) — **Validación offline contra el XSD oficial: verde** (cocos-back `c1940a3`). Objetivo: separar los defectos de estructura del XML de cualquier problema de red o de SUNAT.
  - **Fuente del esquema**: el portal de SUNAT (`cpe.sunat.gob.pe`) responde **403** a cualquier descarga automatizada, así que se usó la fuente upstream que SUNAT declara: el paquete OASIS UBL 2.1 (`https://docs.oasis-open.org/ubl/os-UBL-2.1/UBL-2.1.zip`, 57.9 MB, 82 XSD). Se valida con `xmllint --noout --schema <...>/xsd/maindoc/UBL-Invoice-2.1.xsd our-invoice.xml`.
  - **Cuatro defectos reales encontrados y corregidos**:
    1. `<Invoice ... Id="_0">` — `xml-crypto` v6 ignora `uri: ''`; el flag que activa la referencia vacía es `isEmptyUri`, que por defecto es `false`, así que el firmador generaba un `Id` en la raíz. El `InvoiceType` de UBL **no admite atributos**, así que el documento era inválido por definición. Corregido a `isEmptyUri: true` → `<ds:Reference URI="">`.
    2. `ext:ExtensionContent id="SignST"` — `ExtensionContent` no admite ese atributo. El `Id` se movió a `ds:Signature`, que XMLDSig sí lo permite, y `cac:Signature/cbc:URI>#SignST` sigue resolviendo.
    3. `cbc:Line` dentro de `cac:PostalAddress` — ese elemento no existe en el esquema; es `cbc:StreetName`.
    4. `cbc:Note` estaba al final del documento, pero el XSD exige el orden `…InvoiceTypeCode`, **`Note`**, `TaxPointDate`, `DocumentCurrencyCode`. Movido.
  - **Resultado**: `our-invoice.xml validates`. Guardas añadidas: el spec fija `URI=""`, prohíbe `Id` en la raíz, exige `ds:Signature Id="SignST"`, `cbc:StreetName`, `ExtensionContent` sin atributos y la posición de `cbc:Note`. 51 tests de `src/sunat`, 841 en total.
  - **Hallazgo que el XSD no puede ver**: un XML puede ser válido contra el esquema y aun así ser rechazado por SUNAT, porque SUNAT valida además contra sus catálogos. Comparando con un CPE real aceptado (`Factura-Gravada.xml`, forma que Greenter produce y SUNAT acepta), nuestro XML difiere en 8 puntos:
    1. `cbc:InvoiceTypeCode` sin `listID="0101"` (tipo de operación).
    2. Falta `cbc:IssueTime` (hora de emisión).
    3. `cac:Signature/cbc:ID` debe ser el **RUC del emisor**, no una etiqueta propia.
    4. El domicilio del emisor va como `cac:RegistrationAddress` dentro de `cac:PartyLegalEntity`, con **ubigeo en `cbc:ID`** y `cbc:AddressLine/cbc:Line`; nosotros usamos `cac:PostalAddress` dentro de `cac:Party` y **no tenemos ubigeo en los datos**.
    5. Falta `cac:PaymentTerms` (`FormaPago` / `Contado`).
    6. `cac:TaxScheme` debe ser `ID=1000`, `Name=IGV`, `TaxTypeCode=VAT`; hoy solo emitimos `ID=IGV`.
    7. Falta `cbc:TaxExemptionReasonCode` (tipo de afectación IGV, catálogo 07) en la línea.
    8. Falta `cac:PricingReference/AlternativeConditionPrice` con `PriceTypeCode=01`, necesario porque nuestros precios incluyen IGV.
  - **Consecuencia**: aunque beta hubiera respondido, el CPE habría sido rechazado. De los 8 puntos, 7 son mecánicos (constantes y campos que ya tenemos); el **ubigeo** es el único que exige ampliar `CompanySettings` (hoy solo tiene `ruc`, `legalName`, `address` y series), es decir migración + campo en UI. Queda como decisión pendiente antes de homologación.
- **L10** (2026-11-19) — **Ubigeo resuelto y 7 de los 8 huecos de catálogo cerrados** (cocos-back `cfe0516`, `7cec678`, `dea3bfe`; cocos-web `6df4574`, `97e4a78`).
  - **Catálogo**: se descargó `geodir-ubigeo-inei.csv` de `geodir/ubigeo-peru` — **1874 distritos, 25 departamentos** — y se verificó contra códigos conocidos (`150101` Lima/Lima/Lima, `150122` Miraflores, `040101` Arequipa, `070101` Callao, `250101` Callería/Coronel Portillo). El portal de SUNAT sigue devolviendo **403** a descargas automatizadas. El catálogo se generó como datos tipados y no se edita a mano; "Miraflores" existe en 4 departamentos, por eso la etiqueta del selector lleva provincia, departamento y código.
  - **Modelo**: `CompanySettings.ubigeo String?` guarda **solo el código INEI**; departamento, provincia y distrito se derivan del catálogo al construir el XML, así que un nombre guardado nunca puede contradecir al código. La migración (`20261119021655_add_company_settings_ubigeo`) se escribió a mano porque no hay Postgres accesible (`P1001` en `localhost:5432`); `prisma generate` basta para los tipos.
  - **API**: `GET /api/ubigeos?query=&limit=` (20 por defecto, máximo 50, ignora mayúsculas y acentos, prioriza coincidencias por prefijo de distrito) y `GET /api/ubigeos/:code` (404 si no existe). Los 6 roles autenticados pueden leerlo: es dato de referencia.
  - **Emisión**: se bloquea con 503 y mensaje explícito si falta el ubigeo o no está en el catálogo, igual que ya ocurría con el RUC y la razón social.
  - **Fecha y hora**: `peruTimestamp()` calcula fecha y hora en `America/Lima`. Antes, después de las 19:00 de Lima, `toISOString()` fechaba el CPE con **el día siguiente**.
  - **Builder**: `cac:RegistrationAddress` dentro de `PartyLegalEntity` con ubigeo, `AddressTypeCode` `0000`, provincia/departamento/distrito derivados y `AddressLine`; más `InvoiceTypeCode listID="0101"`, `IssueTime`, `Signature/cbc:ID` = RUC del emisor, `PaymentTerms` `FormaPago`/`Contado`, `TaxScheme` `1000`/`IGV`/`VAT`, `TaxExemptionReasonCode` `10` por línea y `PricingReference` con `PriceTypeCode` `01`. Los `TaxSubtotal` de documento omiten tasa y afectación, como el CPE aceptado.
  - **Verificación**: backend **72 suites / 871 tests**, frontend **1594 tests**, `pnpm check` y build verdes en ambos repos, y `xmllint --noout --schema .../UBL-Invoice-2.1.xsd our-invoice.xml` → **`validates`**.
  - **Abierto (decisión pendiente)**: el CPE aceptado trae `cac:RegistrationAddress` del **adquiriente**, y nuestro `Client` no tiene domicilio, así que la factura sale sin él. No está verificado que SUNAT la rechace; falta decidir si se agrega dirección al cliente o se deja fuera.
  - **Abierto (bloqueo externo)**: la validación end-to-end sigue imposible — beta devuelve `X-Backside-Transport: FAIL FAIL`, y homologación SQA exige certificado emitido contra el RUC de la empresa, usuario SOL secundario con permiso de emisión y afiliación a SEE-Del-Contribuyente.
