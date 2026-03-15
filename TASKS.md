# ClipDub — Tareas Pre-Producción

> **Cómo funciona este archivo:**
>
> Solo se trackean **funcionalidades grandes** que necesitan ser testeadas y aprobadas.
> Los cambios chicos (ajustes de prompt, CSS, refactors menores) NO van acá.
>
> **Estados:**
> - `[ ]` = Pendiente — no se empezó
> - `[~]` = Implementado por Claude — esperando que Gastón lo testee
> - `[x]` = Testeado y aprobado por Gastón — funciona como se esperaba
> - `[!]` = Testeado y rechazado por Gastón — no cumple, necesita revisión
>
> **Flujo:**
> 1. Gastón pide una funcionalidad
> 2. Claude la implementa y marca `[~]`
> 3. Gastón la testea en la app
> 4. Si funciona bien → Gastón marca `[x]` y opcionalmente agrega nota
> 5. Si no cumple → Gastón marca `[!]` con comentario de qué falla
> 6. Claude lee este archivo al inicio de cada conversación

---

## 🔴 CRÍTICO — Bloquea producción

### Seguridad

- [ ] **Rotar API keys** — Generar nuevas keys en Anthropic y ElevenLabs, las actuales están expuestas.
- [ ] **Agregar `.env` al `.gitignore`** — Que secrets nunca se commiteen.
- [ ] **Autenticación real** — Reemplazar mock auth (hardcodea "Demo User"). Login/registro con JWT o sesiones.
- [ ] **Middleware de auth en backend** — Proteger rutas API con auth middleware.
- [ ] **Rate limiting** — `express-rate-limit` en rutas que llaman Anthropic/ElevenLabs.
- [ ] **Headers de seguridad** — Agregar `helmet` al servidor Express.
- [ ] **Restringir CORS** — Limitar a dominio(s) de producción.

### Almacenamiento y persistencia

- [ ] **Base de datos servidor** — Proyectos solo viven en IndexedDB del browser. Implementar DB server-side.
- [ ] **API CRUD de proyectos** — Endpoints `/api/projects` para sincronizar con la DB.
- [ ] **Limpieza de uploads** — Archivos subidos se acumulan sin límite. Implementar cleanup.
- [ ] **Render jobs persistentes** — Jobs en memoria se pierden al reiniciar servidor.

### Rendering de video

- [ ] **Implementar Remotion real** — `render.service.ts` simula progreso, no genera MP4 real.
- [ ] **Pipeline de export funcional** — Botón "Export MP4" debe producir un archivo real.

---

## 🟡 ALTO — Necesario para producción

### Validación de inputs

- [ ] **Validar tipo de archivo en upload** — Solo `.mp4`, `.webm`, `.mov`. Validar MIME type.
- [ ] **Validar parámetro `language`** — Contra lista de idiomas soportados.
- [ ] **Limitar tamaño de frames** — Cantidad y tamaño en `/api/analyze-frames`.
- [ ] **Limitar texto TTS** — Límite de caracteres en `/api/tts`.
- [ ] **Reducir JSON body limit** — Actualmente 50MB, bajar a algo razonable.
- [ ] **Validación con Zod** — Validar request bodies en controllers.

### Configuración de entorno

- [ ] **Variable `NODE_ENV`** — No exponer stack traces en producción.
- [ ] **Validación estricta de env vars** — Fallar si faltan keys críticas en producción.
- [ ] **Documentar config de producción** — `.env.example` completo.

---

## 🟠 MEDIO — Funcionalidad incompleta

### Páginas placeholder

- [ ] **Página Exports** — Actualmente "Coming Soon". Implementar lista de videos exportados.
- [ ] **Página Usage** — Actualmente "Coming Soon". Implementar tracking de créditos.
- [ ] **Página Settings** — Actualmente "Coming Soon". Implementar preferencias de cuenta.

### Features incompletos

- [ ] **Skip Silences** — Toggle es UI-only, falta implementación real en backend.
- [ ] **Sistema de créditos/uso** — No hay tracking de consumo de API por usuario.
- [ ] **Pricing funcional** — Planes en landing dicen "(coming soon)". Conectar con Stripe.

### Calidad de subtítulos (AI)

- [x] **Estilo tutorial: ACCIÓN + ELEMENTO UI** — Cada subtítulo nombra el elemento de interfaz específico.
  > ✅ Aprobado 2026-03-15 — Implementado en `analyze.service.ts`, prompts reescritos.
- [x] **Flujo único sin caminos alternativos** — AI sigue un solo path, no mezcla opciones.
  > ✅ Aprobado 2026-03-15 — Sección SINGLE FLOW agregada al prompt.
- [x] **Verbos consistentes** — "Haz clic en", "Selecciona", "Ingresa", "Escribe" uniformes.
  > ✅ Aprobado 2026-03-15 — VERB RULES expandidas con uso específico por tipo de acción.
- [ ] **Validar calidad con videos reales** — Probar con 3-5 screen recordings y verificar output.

---

## 🔵 BAJO — Mejoras y polish

- [ ] **Fix TS error en VideoPreview.tsx:26** — Error pre-existente con Remotion.
- [ ] **Fix TS errors en remotion/index.ts** — Errores de config pre-existentes.
- [ ] **Actualizar dependencias** — `@anthropic-ai/sdk`, `multer` a latest.
- [ ] **Sync multi-dispositivo** — Acceder a proyectos desde distintos browsers.
- [ ] **Thumbnails en exports** — Generar previews de videos exportados.
- [ ] **Notificaciones de export** — Notificar cuando un render termine.

---

## Historial

| Fecha | Cambio |
|-------|--------|
| 2026-03-15 | Archivo creado con auditoría completa del proyecto |
| 2026-03-15 | ✅ Subtítulos: estilo tutorial + flujo único + verbos consistentes |
