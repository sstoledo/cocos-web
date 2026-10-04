# F11 — Dashboard + Notifications UI

## Objective
Wire the stubbed DashboardPage to GET /api/dashboard/summary and build the real notifications experience (list page + header bell with unread badge) on the B11 contract.

## Problem / Why
DashboardPage (111 lines) renders 3 StatCards + "Actividad reciente" with hooks returning `[]` hard-coded. NotificationListPage is a 24-line stub ("Notificaciones próximamente."). Both backend contracts are LIVE on main.

## Scope (maintainer decision 2026-09-23): COMPLETO
- Notifications: full list page (unread filter, pagination, click → mark read + navigate to link, mark-all-read button) + header bell with unread badge (polling 30s via refetchInterval)
- Dashboard: real cards from summary (ventas hoy, ventas mes, WO pendientes, WO en curso, OC por recibir, notificaciones sin leer)
- "Actividad reciente" card REMOVED in v1 (no backend endpoint — deferred follow-up)
- Stub hooks useDashboardStats/useRecentActivity + DashboardStat/ActivityItem types DELETED

## Contracts (from backend, obs #1278 + #1286)
- GET /api/notifications?unread&page&limit → { data: [{ id, type: 'work_order_ready'|'purchase_order_received', title, body, link, readAt: string|null, createdAt: ISO }], meta: { page, limit, total } } — own, newest first, ALL roles
- PATCH /api/notifications/:id/read → notification DTO (404 NOTIFICATION_NOT_FOUND)
- PATCH /api/notifications/read-all → { count }
- GET /api/dashboard/summary → { salesTodayCount, salesMonthCount, workOrders: { pending, inProgress, done, cancelled }, purchaseOrders: { draft, ordered, partiallyReceived, received, cancelled }, notificationsUnread, generatedAt } — ALL roles, numbers not strings

## Decisions
- Query keys: ['notifications', filters], ['notifications', 'unread-count'], ['dashboard', 'summary'] — invalidate ['notifications'] on mark-read/mark-all
- Badge: GET /notifications?unread=true&limit=1 → meta.total, refetchInterval 30_000, bell visible all roles, click → /notifications
- Click unread notification → PATCH read → navigate(link); already read → navigate directly (links are internal routes /work-orders/:id, /purchase-orders/:id)
- Type labels: work_order_ready → "Orden lista", purchase_order_received → "OC recibida"
- Dashboard cards: Ventas de hoy (salesTodayCount), Ventas del mes (salesMonthCount), Órdenes pendientes (workOrders.pending), Órdenes en curso (workOrders.inProgress), OC por recibir (ordered + partiallyReceived), Notificaciones sin leer (notificationsUnread, links to /notifications)
- No money anywhere (B12 decision); counts are plain numbers
- Roles: no route changes — dashboard + notifications already all-roles in navigation.ts
- Loading skeletons + parseApiError error states per F10 patterns

## Tasks
- [x] F11.1 Notifications data layer → commit 6d44147 on feat/f11-1-notifications-data, 597 lines (155 impl + 442 spec), 694/694 (11 new). Keys ['notifications',params]/['notifications','unread-count']; no-body PATCH per B9/B10 precedent; useUnreadNotificationsCount(refetchInterval?) default off.
- [x] F11.2 Notifications list page → commit 84d4610 on feat/f11-2-notifications-page, 654 lines, 706/706 (12 new). URL-driven filters, mark-all via global unread count, inline role=alert errors (repo has sonner but ZERO toast usage), voseo empty states, es-AR dates. Gotchas: fetch-mock URL parsing (limit=1 matches limit=10), base-ui Switch needs PointerEvent polyfill in jsdom.
- [x] F11.3 Shell header bell + badge → commit d860041 on feat/f11-3-bell-badge, 270 lines, 714/714 (8 new). 99+ cap, aria-label carries count (badge aria-hidden), fail-silent on error, behavioral polling test (fake timers). PR #89 OPEN.
- [x] F11.4 Dashboard data layer → commit 10ca5d5 on feat/f11-4-dashboard-data, 173 lines, 718/718 (4 new). Correction: features/dashboard/ already existed (stubs live there, not in shell/) — data layer added alongside; stubs deleted in F11.5.
- [x] F11.5 Dashboard page rewrite → commit c710373 on feat/f11-5-dashboard-page, 207+/325− (net -118), 715/715 (7 new, 10 removed with stubs). 6 cards all linked to their routes, activity card gone, stubs + types + stub specs deleted (grep-verified zero importers). Loading skeletons w/ aria-busy, role=alert errors.

## Acceptance Criteria
- Badge count matches unread=true meta.total, updates within 30s and immediately after mark-read/all
- List: unread filter + pagination work; click on unread marks it read and navigates; read ones navigate without PATCH
- Dashboard shows real counts from summary; activity card gone
- pnpm check / test (baseline 683) / build green per task

## Checks
- Standard TDD mode (cocos-web): tests required per task. Per-commit gate: assess tier (untracked odd/ → flags from canonical hash). 5 stacked PRs, ask before merge.

## Progress
(started 2026-09-23)

## Next step
FEATURE CLOSED 2026-09-23 — chain #87→#91 merged to main @ d1ffc68 (45d118e, 7e38acc, 6d8ffb3, df91482, d1ffc68), 715/715 tests green on main, zero conflicts, branches cleaned. Roadmap #16 updated. F12 (cash closing UI + PDF) is the LAST unit.