# SPEC 06 — Crear publicación

> **Estado:** Aprobado
> **Depende de:** SPEC 01
> **Fecha:** 2026-11-07
> **Objetivo:** Permitir crear desde el Feed una publicación temporal mediante un modal basado en `references/pantallas/crear-publicacion.dc.html`.

## Alcance

**Incluye:**

- Abrir el modal desde «Nueva publicación» en `/` sin navegar a otra página.
- Reproducir el diseño, los textos y el orden de secciones de la referencia, adaptando el modal a ventanas estrechas y permitiendo desplazamiento vertical si hace falta.
- Ofrecer como destinatarios Mateo, Sofía, Benjamín y «Toda la sala». Permitir elegir varios niños; «Toda la sala» es exclusiva y desmarca a los niños.
- Seleccionar un único tipo entre Comida, Siesta, Actividad, Logro, Ánimo, Foto y Anuncio. Comida aparece seleccionada inicialmente.
- Mostrar la descripción vacía al abrir. Exigir al menos un destinatario y una descripción no vacía, mostrando errores accesibles y conservando los valores cuando la validación falla.
- Permitir adjuntar varias imágenes locales, mostrar una miniatura por archivo y quitar archivos individuales. Las fotos son opcionales y no se fija un límite propio de cantidad o tamaño.
- Cerrar con «Cancelar», X, Escape o clic fuera. Cancelar y cerrar descartan el borrador; cada apertura empieza con Mateo y Comida seleccionados, descripción vacía y sin fotos.
- Al publicar datos válidos, cerrar el modal e insertar la publicación al principio del Feed, por encima de las tres publicaciones estáticas.
- Mostrar como autor el nombre del niño si hay un destinatario, «Varios niños» si hay varios y «Anuncio general» si se eligió toda la sala. Mostrar «Ahora», «familia de [niño]» para un destinatario, «familias de [niños]» para varios y «toda la sala» para el grupo completo, junto con el tipo, la descripción y las fotos adjuntas en la nueva tarjeta.
- Mantener las publicaciones creadas solo en memoria mientras se muestra el Feed; no conservarlas al recargar o abandonar la página.

**Fuera de alcance (para futuras especificaciones):**

- Backend, base de datos, autenticación, envío o sincronización de publicaciones.
- Persistir publicaciones o fotos en `sessionStorage`, `localStorage` o almacenamiento remoto.
- Seleccionar destinatarios distintos de los tres niños de la referencia o cargar la lista desde Kids.
- Editar o eliminar publicaciones, o implementar reacciones y comentarios.
- Subir imágenes a un servidor, conservarlas al cerrar o navegar, o imponer límites propios de cantidad o tamaño.

## Modelo de datos

La publicación nueva existe solo en el estado de React del Feed. Las URL de las imágenes son temporales y se revocan al descartar el borrador o cuando la publicación deja de existir.

```ts
type PostCategory =
  | "Comida"
  | "Siesta"
  | "Actividad"
  | "Logro"
  | "Ánimo"
  | "Foto"
  | "Anuncio";

type FeedPost = {
  id: string;
  author: string;
  authorInitial: string;
  time: "Ahora";
  audience: string;
  category: PostCategory;
  description: string;
  photos: string[]; // URL temporales de objetos de imagen locales
};
```

El estado inicial del modal es `{ recipients: ["Mateo"], category: "Comida", description: "", photos: [] }`. El valor «Toda la sala» no se combina con nombres de niños. La hora visible de una publicación nueva es «Ahora»; la audiencia se expresa como «familia de Mateo», «familias de Mateo y Sofía» o «toda la sala», según la selección.

## Plan de implementación

1. Crear `app/CreatePostModal.tsx` y `app/create-post-modal.module.css`, integrando el disparador accesible desde «Nueva publicación» en `app/page.tsx`; implementar selección, validación, adjuntos locales y todos los métodos de cierre. Verificar que `/` siga cargando y que cancelar/volver a abrir restablezca los valores iniciales.
2. Actualizar `app/page.tsx` y `app/feed.css` para insertar publicaciones válidas al principio del Feed, representar destinatarios, categorías y fotos, y mantener intactas las tres publicaciones estáticas. Verificar que cerrar o cancelar no publique y que la nueva tarjeta aparezca tras publicar.
3. Verificar la apariencia frente a la referencia a 1200 × 800 y en ventana estrecha, los flujos de validación, selección, fotos, publicación y cierre, y ejecutar `npx tsc --noEmit` y `npm run build`.

## Criterios de aceptación

- [ ] «Nueva publicación» en `/` abre el modal sin cambiar la ruta.
- [ ] El modal reproduce el orden y el estilo de la referencia y se adapta a ventanas estrechas sin desbordamiento horizontal.
- [ ] Mateo aparece seleccionado inicialmente; Sofía y Benjamín se pueden seleccionar junto con otros niños.
- [ ] «Toda la sala» desmarca los niños y seleccionar un niño desmarca «Toda la sala».
- [ ] Hay exactamente un tipo seleccionado; Comida es el tipo inicial y se puede cambiar a cualquiera de los otros seis tipos.
- [ ] La descripción empieza vacía. Publicar sin destinatario o con descripción vacía mantiene el modal abierto, señala el error y conserva los valores.
- [ ] Se pueden adjuntar varias imágenes, ver sus miniaturas y quitar cada una; una publicación sin fotos también se puede enviar.
- [ ] Cancelar, X, Escape y clic fuera cierran el modal sin crear una tarjeta y descartan el borrador y sus archivos.
- [ ] Publicar una descripción válida con al menos un destinatario cierra el modal y añade una tarjeta antes de las tres publicaciones originales.
- [ ] La tarjeta muestra «Ahora», la descripción, el tipo, las fotos y la audiencia como familia(s) de los destinatarios o «toda la sala»; su autor corresponde al destinatario según las reglas de esta especificación.
- [ ] Las publicaciones nuevas desaparecen al recargar o abandonar el Feed; no se guardan en almacenamiento del navegador.
- [ ] El modal puede desplazarse verticalmente cuando su contenido excede el alto disponible.
- [ ] `npx tsc --noEmit` y `npm run build` finalizan correctamente.

## Decisiones

- **Sí:** usar un modal en `/` en lugar de una ruta, porque la acción se inicia desde el Feed y no debe interrumpir su contexto.
- **Sí:** añadir la publicación al Feed en memoria, ya que «Publicar» debe producir un resultado visible; no se incorpora persistencia no solicitada.
- **Sí:** limitar los destinatarios a Mateo, Sofía y Benjamín, según la referencia, en lugar de cargar los ocho perfiles de Kids.
- **Sí:** permitir varios destinatarios, pero hacer «Toda la sala» exclusiva para evitar una audiencia ambigua.
- **Sí:** seleccionar Comida inicialmente y dejar la descripción vacía pero obligatoria, separando el ejemplo de texto de la referencia de los datos publicados.
- **Sí:** admitir varias imágenes locales opcionales con miniaturas removibles; no se agregan límites de cantidad o peso no definidos por el producto.
- **Sí:** asignar la etiqueta de autor según la audiencia y mostrar «Ahora» para que el nuevo contenido encaje con las tarjetas existentes.
- **Sí:** expresar la audiencia con «familia de [niño]» o «familias de [niños]», siguiendo el vocabulario de las publicaciones existentes; para toda la sala, mostrar «toda la sala».
- **No:** persistir datos o imágenes; esta pantalla sigue siendo una interacción de demostración en el Feed actual.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Las URL temporales de imágenes pueden quedar activas tras descartar un borrador. | Revocar cada URL al quitar la imagen, cancelar el modal o limpiar las publicaciones al desmontar el Feed. |
| En una ventana baja el contenido puede exceder el espacio visible. | Limitar el alto del diálogo al área visible y desplazar su contenido verticalmente. |
| «Toda la sala» junto con destinatarios individuales puede producir una audiencia confusa. | Hacer que la selección de «Toda la sala» sea mutuamente excluyente con los niños. |

## Qué **no** incluye esta especificación

- Backend, persistencia, autenticación o envío de publicaciones.
- Destinatarios distintos de Mateo, Sofía y Benjamín.
- Carga remota o conservación de las fotos.
- Edición, eliminación, reacciones o comentarios en publicaciones.
