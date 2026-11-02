'use strict';

/* ============================================================
   TaskFlow · Gestor de tareas
   Práctica #3 · Programación Web

   Modelo de datos:
   tareas = [
     {
       id: string,
       titulo: string,
       descripcion: string,
       categoria: 'Estudio' | 'Trabajo' | 'Personal' | 'Hogar' | 'Salud' | 'Otro',
       prioridad: 'alta' | 'media' | 'baja',
       fechaLimite: string,   // formato YYYY-MM-DD o cadena vacía
       completada: boolean,
       creadaEn: number,      // marca de tiempo
       actualizadaEn: number
     }
   ]

   La aplicación permite agregar, visualizar, editar, eliminar,
   buscar, filtrar, ordenar y calcular estadísticas. Los datos se
   guardan en localStorage para conservarlos al recargar.
   ============================================================ */

/* ---------- Constantes y configuración ---------- */

const CLAVE_ALMACENAMIENTO = 'taskflow.tareas.v1';

const CATEGORIAS = ['Estudio', 'Trabajo', 'Personal', 'Hogar', 'Salud', 'Otro'];

const PRIORIDADES = {
    alta: { etiqueta: 'Alta', peso: 3 },
    media: { etiqueta: 'Media', peso: 2 },
    baja: { etiqueta: 'Baja', peso: 1 }
};

const MAPA_ERRORES = {
    titulo: { inputId: 'titulo', errorId: 'errorTitulo' },
    categoria: { inputId: 'categoria', errorId: 'errorCategoria' },
    prioridad: { inputId: 'prioridad', errorId: 'errorPrioridad' },
    fechaLimite: { inputId: 'fechaLimite', errorId: 'errorFechaLimite' }
};

/* Iconos SVG reutilizables (sin dependencias externas) */
const ICONOS = {
    check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>`,
    lapiz: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>`,
    basura: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M10 11v6M14 11v6"/></svg>`,
    calendario: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>`,
    bandeja: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>`,
    alerta: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/><path d="M12 9v4M12 17h.01"/></svg>`,
    info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>`
};

/* ---------- Referencias al DOM ---------- */

const elementos = {
    formTarea: document.getElementById('formTarea'),
    tareaId: document.getElementById('tareaId'),
    titulo: document.getElementById('titulo'),
    descripcion: document.getElementById('descripcion'),
    categoria: document.getElementById('categoria'),
    prioridad: document.getElementById('prioridad'),
    fechaLimite: document.getElementById('fechaLimite'),
    tituloModal: document.getElementById('tituloModalTarea'),
    btnGuardar: document.getElementById('btnGuardar'),
    modalTarea: document.getElementById('modalTarea'),
    btnNuevaTarea: document.getElementById('btnNuevaTarea'),

    modalConfirmar: document.getElementById('modalConfirmar'),
    tituloConfirmar: document.getElementById('tituloConfirmar'),
    mensajeConfirmar: document.getElementById('mensajeConfirmar'),
    btnConfirmar: document.getElementById('btnConfirmar'),
    btnCancelarConfirmar: document.getElementById('btnCancelarConfirmar'),

    listaTareas: document.getElementById('listaTareas'),
    estadoVacio: document.getElementById('estadoVacio'),
    contadorVisibles: document.getElementById('contadorVisibles'),

    buscador: document.getElementById('buscador'),
    btnLimpiarBusqueda: document.getElementById('btnLimpiarBusqueda'),
    filtrosEstado: document.getElementById('filtrosEstado'),
    filtroCategoria: document.getElementById('filtroCategoria'),
    filtroPrioridad: document.getElementById('filtroPrioridad'),
    orden: document.getElementById('orden'),
    btnLimpiarFiltros: document.getElementById('btnLimpiarFiltros'),
    btnLimpiarCompletadas: document.getElementById('btnLimpiarCompletadas'),

    statTotal: document.getElementById('statTotal'),
    statPendientes: document.getElementById('statPendientes'),
    statCompletadas: document.getElementById('statCompletadas'),
    statVencidas: document.getElementById('statVencidas'),
    progressBar: document.getElementById('progressBar'),
    progressText: document.getElementById('progressText'),
    progressTrack: document.getElementById('progressTrack'),
    progressMessage: document.getElementById('progressMessage'),

    toasts: document.getElementById('toasts')
};

/* ---------- Estado de la aplicación ---------- */

let tareas = [];
let confirmacionPendiente = null;

/* ---------- Utilidades generales ---------- */

const $ = (selector, contexto = document) => contexto.querySelector(selector);
const $$ = (selector, contexto = document) => Array.from(contexto.querySelectorAll(selector));

const escaparHTML = (valor = '') => String(valor).replace(/[&<>"']/g, (caracter) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
}[caracter]));

const normalizarTexto = (texto = '') => String(texto)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const generarId = () => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    return `tarea-${Date.now()}-${Math.random().toString(16).slice(2, 9)}`;
};

/* ---------- Utilidades de fechas ---------- */

const fechaLocalISO = (fecha = new Date()) => {
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
};

const hoyISO = () => fechaLocalISO(new Date());

const sumarDiasISO = (dias) => {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + dias);
    return fechaLocalISO(fecha);
};

const esFechaValida = (valor) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;
    const [anio, mes, dia] = valor.split('-').map(Number);
    const fecha = new Date(anio, mes - 1, dia);
    return fecha.getFullYear() === anio
        && fecha.getMonth() === mes - 1
        && fecha.getDate() === dia;
};

const formatearFecha = (fechaIso) => {
    if (!fechaIso) return '';
    const [anio, mes, dia] = fechaIso.split('-').map(Number);
    return new Date(anio, mes - 1, dia).toLocaleDateString('es-MX', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
};

const diferenciaDias = (fechaIso) => {
    const [anio, mes, dia] = fechaIso.split('-').map(Number);
    const objetivo = Date.UTC(anio, mes - 1, dia);
    const ahora = new Date();
    const hoy = Date.UTC(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
    return Math.round((objetivo - hoy) / 86400000);
};

const esVencida = (tarea) => Boolean(tarea.fechaLimite)
    && !tarea.completada
    && tarea.fechaLimite < hoyISO();

const textoFecha = (tarea) => {
    const fecha = formatearFecha(tarea.fechaLimite);
    if (tarea.completada) return `Límite: ${fecha}`;
    const dias = diferenciaDias(tarea.fechaLimite);
    if (dias < 0) return `Venció el ${fecha}`;
    if (dias === 0) return 'Vence hoy';
    if (dias === 1) return 'Vence mañana';
    if (dias <= 7) return `Vence en ${dias} días`;
    return `Vence el ${fecha}`;
};

/* ---------- Persistencia en localStorage ---------- */

const cargarTareas = () => {
    try {
        const guardado = localStorage.getItem(CLAVE_ALMACENAMIENTO);
        if (!guardado) return [];

        const datos = JSON.parse(guardado);
        if (!Array.isArray(datos)) return [];

        return datos
            .filter((tarea) => tarea && typeof tarea === 'object'
                && typeof tarea.titulo === 'string' && tarea.titulo.trim())
            .map((tarea) => ({
                id: tarea.id ? String(tarea.id) : generarId(),
                titulo: String(tarea.titulo).trim().slice(0, 80),
                descripcion: typeof tarea.descripcion === 'string' ? tarea.descripcion.slice(0, 300) : '',
                categoria: CATEGORIAS.includes(tarea.categoria) ? tarea.categoria : 'Otro',
                prioridad: PRIORIDADES[tarea.prioridad] ? tarea.prioridad : 'media',
                fechaLimite: typeof tarea.fechaLimite === 'string' && esFechaValida(tarea.fechaLimite)
                    ? tarea.fechaLimite
                    : '',
                completada: Boolean(tarea.completada),
                creadaEn: Number.isFinite(tarea.creadaEn) ? tarea.creadaEn : Date.now(),
                actualizadaEn: Number.isFinite(tarea.actualizadaEn) ? tarea.actualizadaEn : Date.now()
            }));
    } catch (error) {
        console.error('No se pudieron leer las tareas guardadas:', error);
        return [];
    }
};

const guardarTareas = () => {
    try {
        localStorage.setItem(CLAVE_ALMACENAMIENTO, JSON.stringify(tareas));
    } catch (error) {
        console.error('No se pudieron guardar las tareas:', error);
        mostrarToast('No se pudieron guardar los cambios en el navegador.', 'error');
    }
};

/* ---------- Notificaciones ---------- */

const mostrarToast = (mensaje, tipo = 'exito') => {
    const iconos = { exito: ICONOS.check, error: ICONOS.alerta, info: ICONOS.info };
    const toast = document.createElement('div');
    toast.className = `toast toast-${tipo}`;
    toast.innerHTML = `
        <span class="toast-icono">${iconos[tipo] || ICONOS.info}</span>
        <p>${escaparHTML(mensaje)}</p>
        <button type="button" class="toast-cerrar" aria-label="Cerrar notificación">&times;</button>
    `;

    const quitar = () => {
        if (!toast.isConnected) return;
        toast.classList.add('toast-saliendo');
        window.setTimeout(() => toast.remove(), 220);
    };

    toast.querySelector('.toast-cerrar').addEventListener('click', quitar);
    elementos.toasts.appendChild(toast);
    window.setTimeout(quitar, 3800);
};

/* ---------- Filtros, búsqueda y ordenamiento ---------- */

const obtenerEstadoFiltro = () => {
    const activo = $('.segmentado-btn.activo', elementos.filtrosEstado);
    return activo ? activo.dataset.estado : 'todas';
};

const hayFiltrosActivos = () => normalizarTexto(elementos.buscador.value) !== ''
    || obtenerEstadoFiltro() !== 'todas'
    || elementos.filtroCategoria.value !== 'todas'
    || elementos.filtroPrioridad.value !== 'todas';

const ordenarTareas = (lista) => {
    const criterio = elementos.orden.value;
    const porFecha = (a, b) => (a.fechaLimite || '9999-12-31').localeCompare(b.fechaLimite || '9999-12-31');
    const copia = [...lista];

    switch (criterio) {
        case 'antiguas':
            return copia.sort((a, b) => a.creadaEn - b.creadaEn);
        case 'fecha':
            return copia.sort(porFecha);
        case 'prioridad':
            return copia.sort((a, b) => PRIORIDADES[b.prioridad].peso - PRIORIDADES[a.prioridad].peso || porFecha(a, b));
        case 'titulo':
            return copia.sort((a, b) => a.titulo.localeCompare(b.titulo, 'es', { sensitivity: 'base' }));
        default:
            return copia.sort((a, b) => b.creadaEn - a.creadaEn);
    }
};

const obtenerTareasVisibles = () => {
    const texto = normalizarTexto(elementos.buscador.value);
    const estado = obtenerEstadoFiltro();
    const categoria = elementos.filtroCategoria.value;
    const prioridad = elementos.filtroPrioridad.value;

    const filtradas = tareas.filter((tarea) => {
        if (estado === 'pendientes' && tarea.completada) return false;
        if (estado === 'completadas' && !tarea.completada) return false;
        if (categoria !== 'todas' && tarea.categoria !== categoria) return false;
        if (prioridad !== 'todas' && tarea.prioridad !== prioridad) return false;

        if (texto) {
            const contenido = normalizarTexto(`${tarea.titulo} ${tarea.descripcion} ${tarea.categoria}`);
            if (!contenido.includes(texto)) return false;
        }

        return true;
    });

    return ordenarTareas(filtradas);
};

/* ---------- Renderizado ---------- */

const renderizarEstadisticas = () => {
    const total = tareas.length;
    const completadas = tareas.filter((tarea) => tarea.completada).length;
    const pendientes = total - completadas;
    const vencidas = tareas.filter(esVencida).length;
    const porcentaje = total === 0
        ? 0
        : completadas === total
            ? 100
            : Math.min(99, Math.round((completadas / total) * 100));

    elementos.statTotal.textContent = total;
    elementos.statPendientes.textContent = pendientes;
    elementos.statCompletadas.textContent = completadas;
    elementos.statVencidas.textContent = vencidas;

    elementos.progressBar.style.width = `${porcentaje}%`;
    elementos.progressText.textContent = `${porcentaje}%`;
    elementos.progressTrack.setAttribute('aria-valuenow', String(porcentaje));

    if (total === 0) {
        elementos.progressMessage.textContent = 'Agrega tu primera tarea para comenzar.';
    } else if (porcentaje === 100) {
        elementos.progressMessage.textContent = '¡Excelente! Completaste todas tus tareas.';
    } else if (vencidas > 0) {
        elementos.progressMessage.textContent = `Tienes ${vencidas} tarea${vencidas === 1 ? '' : 's'} vencida${vencidas === 1 ? '' : 's'} por atender.`;
    } else if (porcentaje >= 50) {
        elementos.progressMessage.textContent = 'Vas por buen camino, ¡sigue así!';
    } else {
        elementos.progressMessage.textContent = `Te quedan ${pendientes} tarea${pendientes === 1 ? '' : 's'} pendiente${pendientes === 1 ? '' : 's'}.`;
    }
};

const plantillaTarea = (tarea) => {
    const vencida = esVencida(tarea);
    const etiquetaAlternar = tarea.completada ? 'Marcar como pendiente' : 'Marcar como completada';

    return `
        <article class="tarjeta-tarea prioridad-${tarea.prioridad} ${tarea.completada ? 'completada' : ''}" data-id="${escaparHTML(tarea.id)}">
            <button type="button" class="tarea-check" data-accion="alternar" aria-pressed="${tarea.completada}" aria-label="${etiquetaAlternar}: ${escaparHTML(tarea.titulo)}" title="${etiquetaAlternar}">
                ${ICONOS.check}
            </button>

            <div class="tarea-cuerpo">
                <div class="tarea-titulo-fila">
                    <h3 class="tarea-titulo">${escaparHTML(tarea.titulo)}</h3>
                    <span class="chip chip-prioridad prioridad-${tarea.prioridad}">${PRIORIDADES[tarea.prioridad].etiqueta}</span>
                </div>
                ${tarea.descripcion ? `<p class="tarea-descripcion">${escaparHTML(tarea.descripcion)}</p>` : ''}
                <div class="tarea-meta">
                    <span class="chip chip-categoria" data-categoria="${tarea.categoria}">${tarea.categoria}</span>
                    ${tarea.fechaLimite ? `<span class="meta-fecha ${vencida ? 'vencida' : ''}">${ICONOS.calendario}${textoFecha(tarea)}</span>` : ''}
                </div>
            </div>

            <div class="tarea-acciones">
                <button type="button" class="boton-icono" data-accion="editar" title="Editar tarea" aria-label="Editar tarea: ${escaparHTML(tarea.titulo)}">
                    ${ICONOS.lapiz}
                </button>
                <button type="button" class="boton-icono peligro" data-accion="eliminar" title="Eliminar tarea" aria-label="Eliminar tarea: ${escaparHTML(tarea.titulo)}">
                    ${ICONOS.basura}
                </button>
            </div>
        </article>
    `;
};

const renderizarLista = (visibles) => {
    if (visibles.length === 0) {
        elementos.listaTareas.innerHTML = '';
        elementos.estadoVacio.hidden = false;

        const sinTareas = tareas.length === 0;
        elementos.estadoVacio.innerHTML = `
            <div class="vacio-icono">${ICONOS.bandeja}</div>
            <h3>${sinTareas ? 'Tu lista está vacía' : 'Sin resultados'}</h3>
            <p>${sinTareas
                ? 'Crea tu primera tarea y empieza a organizar tu día. También puedes cargar algunas tareas de ejemplo.'
                : 'No encontramos tareas que coincidan con la búsqueda o los filtros seleccionados.'}</p>
            <div class="vacio-acciones">
                ${sinTareas
                    ? `<button type="button" class="boton boton-primario" data-vacio="crear">Crear mi primera tarea</button>
                       <button type="button" class="boton boton-fantasma" data-vacio="ejemplos">Cargar ejemplos</button>`
                    : `<button type="button" class="boton boton-primario" data-vacio="limpiar">Limpiar filtros</button>`}
            </div>
        `;
        return;
    }

    elementos.estadoVacio.hidden = true;
    elementos.estadoVacio.innerHTML = '';
    elementos.listaTareas.innerHTML = visibles.map(plantillaTarea).join('');
};

const actualizarControles = (visibles) => {
    const completadas = tareas.filter((tarea) => tarea.completada).length;

    elementos.contadorVisibles.textContent = visibles.length;
    elementos.btnLimpiarCompletadas.disabled = completadas === 0;
    elementos.btnLimpiarCompletadas.textContent = completadas > 0
        ? `Limpiar completadas (${completadas})`
        : 'Limpiar completadas';
    elementos.btnLimpiarFiltros.hidden = !hayFiltrosActivos();
    elementos.btnLimpiarBusqueda.hidden = elementos.buscador.value.trim() === '';
};

const render = () => {
    const visibles = obtenerTareasVisibles();
    renderizarEstadisticas();
    renderizarLista(visibles);
    actualizarControles(visibles);
};

/* ---------- Acciones sobre tareas (CRUD) ---------- */

const alternarTarea = (id) => {
    const tarea = tareas.find((item) => item.id === id);
    if (!tarea) return;

    tarea.completada = !tarea.completada;
    tarea.actualizadaEn = Date.now();
    guardarTareas();
    render();

    if (tarea.completada) {
        mostrarToast('¡Tarea completada! Buen trabajo.', 'exito');
    } else {
        mostrarToast('La tarea volvió a la lista de pendientes.', 'info');
    }
};

const eliminarTarea = (id) => {
    const tarea = tareas.find((item) => item.id === id);
    if (!tarea) return;

    tareas = tareas.filter((item) => item.id !== id);
    guardarTareas();
    render();
    mostrarToast('Tarea eliminada correctamente.', 'info');
};

const pedirEliminar = (tarea) => {
    pedirConfirmacion({
        titulo: 'Eliminar tarea',
        mensaje: `¿Seguro que quieres eliminar “${tarea.titulo}”? Esta acción no se puede deshacer.`,
        textoBoton: 'Sí, eliminar',
        alConfirmar: () => eliminarTarea(tarea.id)
    });
};

const pedirLimpiarCompletadas = () => {
    const cantidad = tareas.filter((tarea) => tarea.completada).length;
    if (cantidad === 0) return;

    pedirConfirmacion({
        titulo: 'Limpiar completadas',
        mensaje: `Se eliminarán ${cantidad} tarea${cantidad === 1 ? '' : 's'} completada${cantidad === 1 ? '' : 's'}. Esta acción no se puede deshacer.`,
        textoBoton: 'Sí, limpiar',
        alConfirmar: () => {
            tareas = tareas.filter((tarea) => !tarea.completada);
            guardarTareas();
            render();
            mostrarToast(`Se eliminaron ${cantidad} tarea${cantidad === 1 ? '' : 's'} completada${cantidad === 1 ? '' : 's'}.`, 'info');
        }
    });
};

const cargarEjemplos = () => {
    const ejemplos = [
        {
            titulo: 'Entregar práctica de programación web',
            descripcion: 'Subir el proyecto al aula virtual antes de la medianoche.',
            categoria: 'Estudio',
            prioridad: 'alta',
            fechaLimite: sumarDiasISO(2)
        },
        {
            titulo: 'Comprar despensa de la semana',
            descripcion: 'Frutas, verduras, leche y café.',
            categoria: 'Hogar',
            prioridad: 'media',
            fechaLimite: sumarDiasISO(1)
        },
        {
            titulo: 'Leer 30 minutos',
            descripcion: 'Continuar con el libro de desarrollo personal.',
            categoria: 'Personal',
            prioridad: 'baja',
            fechaLimite: sumarDiasISO(0)
        },
        {
            titulo: 'Revisar apuntes de cálculo',
            descripcion: 'Repasar derivadas e integrales para el examen.',
            categoria: 'Estudio',
            prioridad: 'media',
            fechaLimite: sumarDiasISO(5)
        }
    ];

    const nuevas = ejemplos.map((ejemplo) => ({
        ...ejemplo,
        id: generarId(),
        completada: false,
        creadaEn: Date.now(),
        actualizadaEn: Date.now()
    }));

    tareas = [...nuevas, ...tareas];
    guardarTareas();
    limpiarFiltros({ enfocar: false });
    mostrarToast('Se agregaron 4 tareas de ejemplo.', 'exito');
};

/* ---------- Modal de tarea ---------- */

const abrirModal = (tarea = null) => {
    elementos.formTarea.reset();
    limpiarErrores();

    elementos.tareaId.value = tarea ? tarea.id : '';
    elementos.tituloModal.textContent = tarea ? 'Editar tarea' : 'Nueva tarea';
    elementos.btnGuardar.textContent = tarea ? 'Guardar cambios' : 'Agregar tarea';

    if (tarea) {
        elementos.titulo.value = tarea.titulo;
        elementos.descripcion.value = tarea.descripcion;
        elementos.categoria.value = tarea.categoria;
        elementos.prioridad.value = tarea.prioridad;
        elementos.fechaLimite.value = tarea.fechaLimite;
    } else {
        elementos.categoria.value = 'Personal';
        elementos.prioridad.value = 'media';
        elementos.fechaLimite.value = '';
    }

    elementos.modalTarea.hidden = false;
    actualizarBloqueoScroll();
    window.setTimeout(() => elementos.titulo.focus(), 60);
};

const cerrarModal = () => {
    elementos.modalTarea.hidden = true;
    actualizarBloqueoScroll();
    elementos.formTarea.reset();
    limpiarErrores();
};

/* ---------- Modal de confirmación ---------- */

const pedirConfirmacion = ({ titulo, mensaje, textoBoton, alConfirmar }) => {
    elementos.tituloConfirmar.textContent = titulo;
    elementos.mensajeConfirmar.textContent = mensaje;
    elementos.btnConfirmar.textContent = textoBoton;
    confirmacionPendiente = alConfirmar;
    elementos.modalConfirmar.hidden = false;
    actualizarBloqueoScroll();
    window.setTimeout(() => elementos.btnCancelarConfirmar.focus(), 60);
};

const cerrarConfirmacion = () => {
    elementos.modalConfirmar.hidden = true;
    confirmacionPendiente = null;
    actualizarBloqueoScroll();
};

const confirmarAccion = () => {
    const accion = confirmacionPendiente;
    cerrarConfirmacion();
    if (typeof accion === 'function') accion();
};

const actualizarBloqueoScroll = () => {
    const hayModalAbierto = !elementos.modalTarea.hidden || !elementos.modalConfirmar.hidden;
    document.body.classList.toggle('sin-scroll', hayModalAbierto);
};

/* ---------- Validación del formulario ---------- */

const leerFormulario = () => ({
    titulo: elementos.titulo.value.trim().replace(/\s+/g, ' '),
    descripcion: elementos.descripcion.value.trim(),
    categoria: elementos.categoria.value,
    prioridad: elementos.prioridad.value,
    fechaLimite: elementos.fechaLimite.value
});

const validarTarea = (datos) => {
    const errores = {};

    if (datos.titulo.length < 3) {
        errores.titulo = 'El título debe tener al menos 3 caracteres.';
    } else if (datos.titulo.length > 80) {
        errores.titulo = 'El título no puede superar los 80 caracteres.';
    }

    if (!CATEGORIAS.includes(datos.categoria)) {
        errores.categoria = 'Selecciona una categoría válida.';
    }

    if (!PRIORIDADES[datos.prioridad]) {
        errores.prioridad = 'Selecciona una prioridad válida.';
    }

    if (datos.fechaLimite && !esFechaValida(datos.fechaLimite)) {
        errores.fechaLimite = 'La fecha límite no es válida.';
    }

    return errores;
};

const limpiarErrores = () => {
    Object.values(MAPA_ERRORES).forEach(({ inputId, errorId }) => {
        const input = document.getElementById(inputId);
        const error = document.getElementById(errorId);
        const campo = input ? input.closest('.campo') : null;

        if (campo) campo.classList.remove('campo-con-error');
        if (input) input.removeAttribute('aria-invalid');
        if (error) error.textContent = '';
    });
};

const mostrarErrores = (errores) => {
    Object.entries(errores).forEach(([clave, mensaje]) => {
        const config = MAPA_ERRORES[clave];
        if (!config) return;

        const input = document.getElementById(config.inputId);
        const error = document.getElementById(config.errorId);

        if (input) {
            input.setAttribute('aria-invalid', 'true');
            const campo = input.closest('.campo');
            if (campo) campo.classList.add('campo-con-error');
        }
        if (error) error.textContent = mensaje;
    });

    const primerError = Object.keys(errores)[0];
    const config = MAPA_ERRORES[primerError];
    if (config) {
        const input = document.getElementById(config.inputId);
        if (input) input.focus();
    }
};

const quitarErrorCampo = (evento) => {
    const campo = evento.target.closest('.campo');
    if (!campo) return;

    campo.classList.remove('campo-con-error');
    evento.target.removeAttribute('aria-invalid');
    const mensaje = campo.querySelector('.mensaje-error');
    if (mensaje) mensaje.textContent = '';
};

const manejarEnvio = (evento) => {
    evento.preventDefault();
    limpiarErrores();

    const datos = leerFormulario();
    const errores = validarTarea(datos);

    if (Object.keys(errores).length > 0) {
        mostrarErrores(errores);
        mostrarToast('Revisa los campos marcados antes de guardar.', 'error');
        return;
    }

    const id = elementos.tareaId.value;

    if (id) {
        const indice = tareas.findIndex((tarea) => tarea.id === id);
        if (indice === -1) {
            mostrarToast('La tarea ya no existe. Actualiza la lista.', 'error');
            cerrarModal();
            render();
            return;
        }

        tareas[indice] = {
            ...tareas[indice],
            ...datos,
            actualizadaEn: Date.now()
        };

        guardarTareas();
        cerrarModal();
        render();
        mostrarToast('Tarea actualizada correctamente.', 'exito');
        return;
    }

    tareas.unshift({
        id: generarId(),
        ...datos,
        completada: false,
        creadaEn: Date.now(),
        actualizadaEn: Date.now()
    });

    guardarTareas();
    cerrarModal();
    limpiarFiltros({ enfocar: false });
    mostrarToast('¡Tarea agregada correctamente!', 'exito');
};

/* ---------- Filtros y acciones de la interfaz ---------- */

const limpiarFiltros = ({ enfocar = true } = {}) => {
    elementos.buscador.value = '';
    elementos.filtroCategoria.value = 'todas';
    elementos.filtroPrioridad.value = 'todas';
    elementos.orden.value = 'recientes';

    $$('.segmentado-btn', elementos.filtrosEstado).forEach((boton) => {
        const activo = boton.dataset.estado === 'todas';
        boton.classList.toggle('activo', activo);
        boton.setAttribute('aria-pressed', String(activo));
    });

    render();
    if (enfocar) elementos.buscador.focus();
};

const manejarAccionLista = (evento) => {
    const boton = evento.target.closest('[data-accion]');
    if (!boton) return;

    const tarjeta = boton.closest('.tarjeta-tarea');
    if (!tarjeta) return;

    const tarea = tareas.find((item) => item.id === tarjeta.dataset.id);
    if (!tarea) return;

    switch (boton.dataset.accion) {
        case 'alternar':
            alternarTarea(tarea.id);
            break;
        case 'editar':
            abrirModal(tarea);
            break;
        case 'eliminar':
            pedirEliminar(tarea);
            break;
        default:
            break;
    }
};

const manejarAccionVacio = (evento) => {
    const boton = evento.target.closest('[data-vacio]');
    if (!boton) return;

    switch (boton.dataset.vacio) {
        case 'crear':
            abrirModal();
            break;
        case 'ejemplos':
            cargarEjemplos();
            break;
        case 'limpiar':
            limpiarFiltros();
            break;
        default:
            break;
    }
};

/* ---------- Eventos ---------- */

const configurarEventos = () => {
    elementos.btnNuevaTarea.addEventListener('click', () => abrirModal());

    elementos.formTarea.addEventListener('submit', manejarEnvio);
    elementos.formTarea.addEventListener('input', quitarErrorCampo);

    elementos.modalTarea.addEventListener('click', (evento) => {
        if (evento.target.closest('[data-close]')) cerrarModal();
    });

    elementos.modalConfirmar.addEventListener('click', (evento) => {
        if (evento.target.closest('[data-close]')) cerrarConfirmacion();
    });

    elementos.btnConfirmar.addEventListener('click', confirmarAccion);

    elementos.buscador.addEventListener('input', render);
    elementos.filtroCategoria.addEventListener('change', render);
    elementos.filtroPrioridad.addEventListener('change', render);
    elementos.orden.addEventListener('change', render);

    elementos.btnLimpiarBusqueda.addEventListener('click', () => {
        elementos.buscador.value = '';
        render();
        elementos.buscador.focus();
    });

    elementos.filtrosEstado.addEventListener('click', (evento) => {
        const boton = evento.target.closest('[data-estado]');
        if (!boton) return;

        $$('.segmentado-btn', elementos.filtrosEstado).forEach((opcion) => {
            const esActivo = opcion === boton;
            opcion.classList.toggle('activo', esActivo);
            opcion.setAttribute('aria-pressed', String(esActivo));
        });

        render();
    });

    elementos.listaTareas.addEventListener('click', manejarAccionLista);
    elementos.estadoVacio.addEventListener('click', manejarAccionVacio);
    elementos.btnLimpiarFiltros.addEventListener('click', () => limpiarFiltros());
    elementos.btnLimpiarCompletadas.addEventListener('click', pedirLimpiarCompletadas);

    document.addEventListener('keydown', (evento) => {
        if (evento.key !== 'Escape') return;

        if (!elementos.modalConfirmar.hidden) {
            cerrarConfirmacion();
        } else if (!elementos.modalTarea.hidden) {
            cerrarModal();
        }
    });

    window.addEventListener('storage', (evento) => {
        if (evento.key !== CLAVE_ALMACENAMIENTO) return;
        tareas = cargarTareas();
        render();
        mostrarToast('Los datos se actualizaron desde otra pestaña.', 'info');
    });
};

/* ---------- Inicio ---------- */

const iniciar = () => {
    tareas = cargarTareas();
    configurarEventos();
    render();
};

document.addEventListener('DOMContentLoaded', iniciar);




