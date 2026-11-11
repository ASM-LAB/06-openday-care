# SPEC 13 — Feed persistente y gestión de publicaciones

> **Estado:** Borrador
> **Depende de:** SPEC 06, SPEC 11, SPEC 12
> **Fecha:** 2026-11-11
> **Objetivo:** Conectar el feed y el compositor actuales a publicaciones persistentes con destinatarios reales e imágenes opcionales.

## Alcance

**Incluye:**

- Reutilizar el feed en `/` y el modal existente para consultar, crear, editar y borrar publicaciones persistidas.
- Reemplazar destinatarios ficticios por salas reales y la opción «Toda la guardería».
- Mantener las siete categorías actuales, el texto obligatorio y la publicación inmediata sin título.
- Permitir hasta cinco imágenes JPG, PNG o WebP de 10 MB o menos por publicación; las imágenes son opcionales y se guardan en el bucket privado de SPEC 12.
- Mostrar autor y fecha reales, texto, categoría, destinatario y fotos autorizadas.
- Permitir editar o borrar al autor; un administrador activo puede gestionar cualquier publicación de su guardería.
- Pedir confirmación antes del borrado definitivo.
- Mostrar las veinte publicaciones más recientes y ofrecer «Cargar más» en páginas de veinte.
- Mostrar publicaciones autorizadas para cada rol, usando los permisos definidos en SPEC 11 y SPEC 12.
- Retirar las tres publicaciones estáticas de demostración.
- Implementar estados de carga, feed vacío, errores accesibles y conservación del borrador ante fallos de publicación o carga.

**Fuera de alcance (para futuras especificaciones):**

- Reacciones, comentarios, notificaciones, borradores, programación o publicación futura.
- Alta de padres/tutores, creación de salas o gestión de relaciones familiares.
- Cambio del diseño general del Feed fuera de los controles necesarios para esta función.
- Publicaciones con destinatarios individuales por niño.

## Modelo de datos

No se agregan tablas en esta especificación. Se consumen `Post` y `PostPhoto` definidos en SPEC 12, las salas de SPEC 10 y los vínculos `ParentChild` de SPEC 11.

El compositor traduce categorías visibles a los códigos persistidos: Comida=`meal`, Siesta=`nap`, Actividad=`activity`, Logro=`achievement`, Ánimo=`mood`, Foto=`photo` y Anuncio=`announcement`. La opción «Toda la guardería» se envía como destinatario sin sala; una sala seleccionada envía su UUID.

## Plan de implementación

1. Conectar la carga de `/` a las operaciones de servidor de SPEC 12 y obtener el perfil activo y el rol desde la sesión verificada del servidor; mantener la autorización real en servidor/RLS.
2. Sustituir en `app/FeedClient.tsx` las publicaciones de demostración y estado temporal por el listado persistido, con autor, fecha, audiencia, categoría y fotos autorizadas. Añadir estados de carga, vacío y error.
3. Actualizar `app/CreatePostModal.tsx` y `app/create-post-modal.module.css` para cargar salas reales, seleccionar sala o toda la guardería, validar texto/categoría y aceptar imágenes dentro de los límites acordados. Conectar el envío y conservar el formulario si falla.
4. Añadir controles de edición y borrado según autor/rol; rellenar el formulario al editar, permitir añadir o quitar fotos sin superar el máximo total de cinco, y exigir confirmación accesible antes de borrar.
5. Implementar la paginación por fecha descendente con cursor estable, cargar veinte registros por solicitud y evitar duplicados al pedir páginas posteriores.
6. Verificar manualmente los recorridos con sesiones staff, admin y parent, incluidos límites de destinatario, imágenes, paginación, errores, revocación de acceso y diseño adaptable; ejecutar `npx tsc --noEmit` y `npm run build`.

## Criterios de aceptación

- [ ] El feed consulta datos persistidos y una publicación sigue visible tras recargar si la sesión conserva autorización.
- [ ] No aparecen las tres publicaciones estáticas anteriores ni publicaciones nuevas guardadas solo en estado local.
- [ ] Un perfil parent no ve controles para crear, editar o borrar; intentar estas operaciones directamente también es rechazado por servidor/RLS.
- [ ] Staff/admin activos pueden abrir el compositor; solo pueden publicar en su propia guardería.
- [ ] El selector carga salas existentes y ofrece «Toda la guardería»; no aparecen nombres ficticios como Mateo, Sofía o Benjamín como destinatarios de prueba.
- [ ] Se puede publicar sin imágenes o con hasta cinco imágenes válidas; se rechazan formatos no permitidos, archivos mayores de 10 MB y más de cinco fotos en total.
- [ ] Una validación o fallo de carga/escritura mantiene el modal y sus datos, anuncia el error de forma accesible y no añade una tarjeta exitosa.
- [ ] Una publicación muestra el nombre del autor, la fecha, destinatario, categoría, texto y fotos autorizadas.
- [ ] Las publicaciones de sala y de toda la guardería respetan los permisos por rol y vínculo; cambiar el UUID o la sala desde el cliente no amplía el acceso.
- [ ] El autor puede editar o borrar sus entradas; un admin de la misma guardería puede gestionar cualquiera; otro staff no puede gestionar entradas ajenas.
- [ ] Editar conserva los datos no modificados, permite agregar/quitar fotos y no permite superar cinco fotos en total.
- [ ] Borrar requiere confirmación y, al completarse, la publicación y sus fotos dejan de aparecer; un fallo muestra error sin comunicar éxito.
- [ ] El feed muestra primero veinte publicaciones más recientes; «Cargar más» agrega las siguientes veinte sin duplicados y desaparece cuando no quedan más.
- [ ] Un feed sin publicaciones muestra un estado vacío; un fallo de consulta muestra un error y no se presenta como lista vacía exitosa.
- [ ] El modal y el feed funcionan en ventana estrecha sin desbordamiento horizontal.
- [ ] `npx tsc --noEmit` y `npm run build` finalizan correctamente con la configuración requerida.

## Decisiones

- **Sí:** conservar el modal de creación en `/`, ampliar sus destinatarios y conectarlo a datos reales en vez de crear otra ruta.
- **Sí:** retirar ejemplos fijos para que el feed no mezcle datos ficticios con publicaciones persistentes.
- **Sí:** ordenar y paginar el feed por `published_at` descendente con un cursor estable; no descargar todo el historial de una vez.
- **Sí:** mostrar controles según permisos para orientar la interfaz, pero dejar la decisión final a servidor, RLS y Storage.
- **Sí:** confirmar el borrado porque elimina permanentemente también los archivos asociados.
- **No:** añadir destinatarios por niño, título, comentarios, reacciones, borradores o programación.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| El feed conserva referencias a objetos de imagen temporales del compositor original. | Reemplazar URL locales por rutas privadas de SPEC 12 y revocar las URL temporales al cancelar o cerrar el modal. |
| Las páginas pueden repetir u omitir registros si se ordenan solo por fecha. | Usar cursor compuesto y orden determinista, por ejemplo `published_at` y `id`. |
| Una interfaz oculta puede confundirse con autorización. | Probar operaciones directas de usuarios no autorizados y mantener comprobaciones en servidor, RLS y Storage. |
| Una familia puede perder acceso a una foto cuando se elimina su vínculo. | Revalidar la autorización para cada lectura y refrescar el feed tras cambios de acceso. |

## Qué **no** incluye esta especificación

- Cambios de esquema, políticas o bucket; corresponden a SPEC 11 y SPEC 12.
- Registro/invitaciones, administración de salas y destinatarios individuales por niño.
- Reacciones, comentarios, notificaciones, borradores o publicaciones programadas.
