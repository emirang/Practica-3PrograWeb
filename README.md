# TaskFlow · Gestor de Tareas

Aplicación web desarrollada con **HTML, CSS y JavaScript puro** para la Práctica #3 de Programación Web. Permite administrar tareas personales o académicas desde el navegador, sin recargar la página y conservando la información en `localStorage`.

## Cómo ejecutar

1. Abre el archivo `index.html` en cualquier navegador moderno (Chrome, Edge, Firefox).
2. También puedes usar una extensión como **Live Server** en VS Code y abrir la URL que genere.

> No requiere instalación, servidor ni librerías externas. Si el navegador restringe `localStorage` al abrir archivos locales, utiliza Live Server.

## Funcionalidades

- **Agregar tareas** con título, descripción, categoría, prioridad y fecha límite.
- **Visualizar** todas las tareas en tarjetas con su información y estado.
- **Editar** cualquier registro mediante un formulario modal precargado.
- **Eliminar** tareas con un diálogo de confirmación.
- **Marcar como completada / pendiente** con un clic.
- **Buscar** por título, descripción o categoría (ignora acentos y mayúsculas).
- **Filtrar** por estado, categoría y prioridad.
- **Ordenar** por fecha de creación, fecha límite, prioridad o título.
- **Estadísticas automáticas**: total, pendientes, completadas y vencidas.
- **Barra de progreso** con el porcentaje de tareas completadas.
- **Contador** de tareas visibles según los filtros aplicados.
- **Limpiar completadas** en una sola acción.
- **Persistencia automática** en `localStorage`.
- **Tareas de ejemplo** opcionales desde el estado vacío.
- **Notificaciones tipo toast** para confirmar acciones y mostrar errores.
- **Diseño responsivo** para computadora, tableta y celular.
- **Sincronización entre pestañas** mediante el evento `storage`.

## Cumplimiento de los requisitos

| # | Requisito | Implementación |
|---|-----------|----------------|
| 1 | Aplicación tipo gestor de tareas | TaskFlow |
| 2 | Modelar datos con objetos y arreglos | Arreglo global `tareas` con objetos `{ id, titulo, descripcion, categoria, prioridad, fechaLimite, completada, creadaEn }` |
| 3 | Agregar, visualizar, editar y eliminar | `manejarEnvio()`, `render()`, `abrirModal()`, `eliminarTarea()` |
| 4 | Manipular el DOM sin recargar | Renderizado dinámico de tarjetas, estadísticas, modales y toasts |
| 5 | Eventos y sintaxis moderna | `let`/`const`, funciones flecha, template literals, spread, desestructuración, `map`, `filter`, `find`, `sort`, optional chaining |
| 6 | Validar y mostrar mensajes | `validarTarea()` con errores en línea y notificaciones claras |
| 7 | Guardar y recuperar con localStorage | `guardarTareas()` y `cargarTareas()` con clave `taskflow.tareas.v1` |
| 8 | Función adicional | Búsqueda, filtros, ordenamiento, contadores, progreso y detección de tareas vencidas |

## Estructura del proyecto

```
Practica#3/
├── index.html      Estructura de la interfaz y formularios modales
├── styles.css      Diseño, colores, animaciones y adaptación a móviles
├── app.js          Modelo de datos, CRUD, validaciones, filtros y localStorage
└── README.md       Documentación del proyecto
```

## Modelo de datos

```js
{
    id: 'uuid',
    titulo: 'Entregar práctica de programación web',
    descripcion: 'Subir el proyecto al aula virtual.',
    categoria: 'Estudio',            // Estudio | Trabajo | Personal | Hogar | Salud | Otro
    prioridad: 'alta',               // alta | media | baja
    fechaLimite: '2026-11-10',       // YYYY-MM-DD o cadena vacía
    completada: false,
    creadaEn: 1762164000000,
    actualizadaEn: 1762164000000
}
```

## Funciones principales

| Función | Propósito |
|---------|-----------|
| `iniciar()` | Carga los datos, registra eventos y pinta la interfaz |
| `cargarTareas()` / `guardarTareas()` | Leen y escriben en `localStorage` con validación de datos |
| `render()` | Actualiza estadísticas, lista, contadores y controles |
| `obtenerTareasVisibles()` | Aplica búsqueda, filtros y ordenamiento |
| `alternarTarea()` | Cambia el estado completada/pendiente |
| `abrirModal()` / `cerrarModal()` | Controlan el formulario de alta y edición |
| `manejarEnvio()` | Valida y guarda una tarea nueva o editada |
| `eliminarTarea()` / `pedirEliminar()` | Eliminan registros con confirmación |
| `validarTarea()` | Comprueba título, categoría, prioridad y fecha |
| `mostrarToast()` | Muestra mensajes de éxito, error o información |
| `esVencida()` / `textoFecha()` | Calculan tareas vencidas y fechas legibles |
| `cargarEjemplos()` | Inserta tareas de demostración |

## Validaciones implementadas

- El título es obligatorio y debe tener entre 3 y 80 caracteres.
- La categoría debe pertenecer a la lista permitida.
- La prioridad debe ser alta, media o baja.
- La fecha límite, si se captura, debe ser una fecha real en formato `YYYY-MM-DD`.
- Los campos con error se resaltan y muestran un mensaje específico.
- El contenido del usuario se escapa antes de insertarse en el DOM para evitar inyecciones de HTML.

## Pruebas realizadas

Se verificó en navegador el flujo completo:

- Alta de tareas y actualización inmediata de la lista y contadores.
- Validación de campos vacíos sin cerrar el formulario.
- Edición de una tarea existente.
- Marcado como completada y actualización del progreso.
- Búsqueda sin acentos, filtros y limpieza de filtros.
- Eliminación con confirmación.
- Persistencia de los datos después de recargar la página.
- Carga de tareas de ejemplo y visualización en escritorio y móvil.

## Nota sobre localStorage

Los datos se guardan únicamente en el navegador utilizado. Si se borran los datos de navegación o se usa otro navegador/perfil, la lista aparecerá vacía. La clave utilizada es:

```js
taskflow.tareas.v1
```
