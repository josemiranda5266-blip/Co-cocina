# Hallazgos — Co-cocina

Última auditoría: 2026-09-25

COC-SEC-001 CRÍTICA — Autorización administrativa solo en frontend.
COC-SEC-002 CRÍTICA — Collector público y autoApprove controlable por cliente.
COC-DATA-001 CRÍTICA — Catálogo/reportes/analítica en memoria.
COC-SEC-003 CRÍTICA — SSRF mediante WebsiteConnector.
COC-SEC-004 ALTA — Embed URL arbitraria.
COC-SEC-005 ALTA — Reportes públicos sin auth/rate limit.
COC-SEC-006 ALTA — Falta hardening HTTP.
COC-DATA-002 ALTA — API pública permite consultar estados internos.
COC-DATA-003 ALTA — Detalle público no restringe ACTIVE.
COC-API-001 MEDIA — Vistas manipulables.
COC-API-002 MEDIA — Métricas/reportes sin paginación.
COC-AI-001 ALTA — Metadata externa interpolada en prompts.
COC-AI-002 MEDIA — Gemini sin controles de coste.
COC-DATA-004 CRÍTICA — Fallbacks ficticios en metadata.
COC-DATA-005 MEDIA — IDs/datos derivados frágiles o inventados.
COC-SEC-007 ALTA — Validación YouTube basada en regex débil.
COC-UX-001 MEDIA — Autoaprobación por defecto.
COC-AUTH-001 ALTA — No hay autenticación real.
COC-DATA-006 MEDIA — Favoritos/colecciones en localStorage.
COC-ARCH-001 MEDIA — Recipe sobrecargado para catálogo de videos.
COC-ARCH-002 ALTA — Conectores simulados/incompletos.
COC-BUILD-001 MEDIA — Residuos específicos de AI Studio.
COC-OPS-001 ALTA — Sin suite de tests/CI visible.

Las correcciones futuras deben marcar cada ID como corregido únicamente cuando exista evidencia de código y pruebas.