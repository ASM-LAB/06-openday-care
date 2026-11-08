# SPEC 07 — Crear tabla daycares

> **Estado:** Aprobado
> **Depende de:** Ninguna
> **Fecha:** 2026-11-08
> **Objetivo:** Crear `public.daycares` según la referencia y desplegarla mediante una migración versionada de Supabase CLI, preservando el historial remoto existente.

## Alcance

**Incluye:**

- Inicializar en el repositorio el flujo imperativo de Supabase CLI, con `supabase/config.toml` y el directorio `supabase/migrations/`.
- Añadir una migración versionada que cree únicamente `public.daycares` con `id uuid` como PK y default `gen_random_uuid()`, `name text NOT NULL` y `created_at timestamptz NOT NULL DEFAULT now()`.
- Activar RLS en `public.daycares` sin crear políticas; el acceso directo mediante la API queda denegado hasta que otra especificación defina el modelo de autorización.
- Validar la migración en la base local de Supabase y aplicarla al proyecto remoto vinculado después de reconciliar su historial de migraciones.
- Confirmar que la tabla queda creada en el remoto y que el historial anterior permanece intacto.

**Fuera de alcance (para futuras especificaciones):**

- Insertar una guardería inicial o cualquier dato de prueba.
- Añadir `updated_at`, índices, triggers, funciones o políticas RLS.
- Crear otras tablas, configurar autenticación o integrar la tabla con la aplicación Next.js.
- Eliminar, reparar o modificar las entradas de migración que ya existen en el remoto.

## Modelo de datos

La tabla contiene solo los campos definidos en la referencia, con defaults y nulabilidad acordados:

```sql
CREATE TABLE public.daycares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.daycares ENABLE ROW LEVEL SECURITY;
```

No se crean políticas en esta especificación. La tabla queda vacía después de aplicar la migración.

## Plan de implementación

1. Inicializar Supabase CLI en el repositorio, comprobar la versión y los comandos disponibles, y crear `supabase/config.toml` sin modificar la aplicación Next.js. Verificar que el CLI reconoce el proyecto local.
2. Vincular el proyecto remoto objetivo e inspeccionar su historial. El remoto actualmente registra `20261108102017_crear_tabla_prueba` y `20261108102222_eliminar_tabla_prueba`, pero no hay archivos locales correspondientes. Localizar y reconciliar sus migraciones originales antes de continuar; si no se puede hacer sin alterar o inventar historial, detenerse sin hacer push.
3. Generar la nueva migración con `supabase migration new create_daycares`, implementar el esquema definido en esta especificación y validar la migración en la base local. Confirmar columnas, defaults, PK, RLS habilitado, ausencia de políticas y ausencia de filas iniciales.
4. Aplicar las migraciones pendientes al proyecto vinculado con `supabase db push --remote` únicamente después de que el historial local y remoto esté reconciliado y la validación local haya pasado. Verificar en el remoto la tabla, su esquema, RLS y el registro de la nueva migración, sin alterar las dos entradas previas.

## Criterios de aceptación

- [ ] Existe `supabase/config.toml` y el repositorio utiliza migraciones imperativas de Supabase CLI.
- [ ] Existe una migración generada por `supabase migration new` que crea solo `public.daycares` con `id`, `name` y `created_at` según el modelo de datos.
- [ ] `id` es UUID, PK y tiene default `gen_random_uuid()`; `name` es obligatorio; `created_at` es obligatorio y tiene default `now()`.
- [ ] RLS está habilitado y no hay políticas para `public.daycares`.
- [ ] La migración pasa la validación local y la tabla queda sin filas iniciales.
- [ ] Tras aplicar la migración al remoto, `public.daycares` existe con el esquema esperado y la nueva versión aparece aplicada en el historial.
- [ ] Las dos entradas remotas de prueba existentes no se borran, reparan ni sustituyen.
- [ ] Si el historial remoto no se puede reconciliar fielmente, no se aplica ninguna migración remota y se informa el bloqueo.
- [ ] No se modifican archivos de la aplicación ni se crean tablas adicionales.

## Decisiones

- **Sí:** seguir el esquema de referencia para los tres campos; usar UUID generado por defecto, nombre obligatorio y fecha de creación automática para que la tabla pueda insertarse sin proporcionar esos valores.
- **No:** añadir `updated_at`; el diccionario de `daycares` no lo define.
- **Sí:** activar RLS sin políticas; no hay todavía un modelo de acceso autorizado para la tabla raíz.
- **No:** insertar una fila inicial; esta especificación crea estructura únicamente.
- **Sí:** inicializar el flujo imperativo de Supabase CLI y mantener la migración versionada en el repositorio para que el cambio sea reproducible.
- **No:** aplicar DDL remoto directamente con MCP ni modificar el historial existente para forzar el push; se preserva el historial y se detiene el despliegue si no puede reconciliarse fielmente.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Las dos migraciones remotas de prueba no tienen archivos locales y el CLI puede rechazar el push por divergencia de historial. | Localizar y reconciliar sus migraciones originales antes del push. No fabricar archivos vacíos ni ejecutar `migration repair`; detener el despliegue si no se puede preservar el historial. |
| Una tabla en un esquema expuesto sin políticas podría confundirse con una tabla accesible o quedar expuesta por cambios futuros de permisos. | Activar RLS desde la migración y no añadir políticas hasta definir el modelo de autorización en una especificación posterior. |

## Qué **no** incluye esta especificación

- Datos iniciales, `updated_at`, otras tablas, índices, triggers o funciones.
- Políticas RLS, autenticación o integración con la aplicación.
- Eliminar, reparar o falsificar entradas de migración remotas existentes.
- Aplicar el cambio al remoto si el historial no se ha reconciliado fielmente.
