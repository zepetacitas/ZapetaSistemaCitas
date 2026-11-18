
document.addEventListener("DOMContentLoaded", () => {

    // =====================================
    // TOAST PROFESIONAL
    // =====================================

    function mostrarToast(mensaje, tipo = "error") {

        if (!mensaje) return;

        const contenedor = document.getElementById("toastContainer");
        if (!contenedor) return;

        const configuracion = {
            error: { titulo: "No se pudo completar", icono: "!" },
            success: { titulo: "Operación exitosa", icono: "✓" },
            info: { titulo: "Información", icono: "i" }
        };

        const config = configuracion[tipo] || configuracion.info;

        const toast = document.createElement("div");
        toast.className = `toast toast-${tipo}`;

        const icono = document.createElement("span");
        icono.className = "toast-icon";
        icono.textContent = config.icono;

        const contenido = document.createElement("div");
        contenido.className = "toast-contenido";

        const titulo = document.createElement("strong");
        titulo.textContent = config.titulo;

        const texto = document.createElement("p");
        texto.textContent = mensaje;

        const cerrar = document.createElement("button");
        cerrar.type = "button";
        cerrar.className = "toast-cerrar";
        cerrar.textContent = "×";
        cerrar.setAttribute("aria-label", "Cerrar");

        const barra = document.createElement("div");
        barra.className = "toast-barra";

        contenido.append(titulo, texto);
        toast.append(icono, contenido, cerrar, barra);
        contenedor.appendChild(toast);

        let eliminado = false;

        const temporizador = window.setTimeout(cerrarToast, 6000);

        function cerrarToast() {
            if (eliminado) return;

            eliminado = true;
            clearTimeout(temporizador);

            toast.classList.add("toast-saliendo");

            setTimeout(() => toast.remove(), 250);
        }

        cerrar.addEventListener("click", cerrarToast);
    }

    // =====================================
    // RECIBIR ERROR DEL CONTROLADOR
    // =====================================

    const elementoMensaje = document.getElementById("mensajeServidor");

    if (elementoMensaje) {
        const mensaje = elementoMensaje.dataset.mensaje;

        if (mensaje && mensaje.trim()) {
            mostrarToast(mensaje, "error");
        }
    }
    // =====================================
// RECIBIR MENSAJE DE REGISTRO EXITOSO
// =====================================

const elementoExito = document.getElementById("mensajeExito");

if (elementoExito) {
    const mensaje = elementoExito.dataset.mensaje;

    if (mensaje && mensaje.trim()) {
        mostrarToast(mensaje, "success");
    }
}
    // =====================================
    // VALIDAR FORMULARIO ANTES DE ENVIAR
    // =====================================

    const formulario = document.getElementById("formularioCita");

    if (formulario) {

        formulario.addEventListener("submit", (evento) => {

            const nombre = formulario.querySelector('[name="nombre"]').value.trim();
            const apellido = formulario.querySelector('[name="apellido"]').value.trim();
            const correo = formulario.querySelector('[name="correo"]').value.trim();
            const area = formulario.querySelector('[name="area"]').value;
            const fecha = formulario.querySelector('[name="fecha"]').value;
            const hora = formulario.querySelector('[name="hora"]').value;

            if (!nombre || !apellido || !correo || !area || !fecha || !hora) {
                evento.preventDefault();
                mostrarToast("Completa todos los campos del formulario.", "error");
                return;
            }

            const formatoCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!formatoCorreo.test(correo)) {
                evento.preventDefault();
                mostrarToast("Ingresa un correo electrónico válido.", "error");
                return;
            }

            // Fecha actual de México
            const partes = new Intl.DateTimeFormat("en-CA", {
                timeZone: "America/Mexico_City",
                year: "numeric",
                month: "2-digit",
                day: "2-digit"
            }).formatToParts(new Date());

            const valores = {};
            partes.forEach(p => valores[p.type] = p.value);

            const hoy = `${valores.year}-${valores.month}-${valores.day}`;

            if (fecha < hoy) {
                evento.preventDefault();
                mostrarToast(
                    "No puedes agendar citas en días anteriores a hoy. Selecciona una fecha válida.",
                    "error"
                );
                return;
            }

            if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(hora)) {
                evento.preventDefault();
                mostrarToast("Selecciona una hora válida.", "error");
                return;
            }

            if (hora < "07:00" || hora > "20:00") {
                evento.preventDefault();
                mostrarToast(
                    "El horario permitido es de 7:00 a. m. a 8:00 p. m.",
                    "error"
                );
                return;
            }

        });
    }

    // =====================================
    // CONFIRMAR ELIMINACIÓN
    // =====================================

    document.querySelectorAll(".form-eliminar").forEach(formularioEliminar => {

        formularioEliminar.addEventListener("submit", evento => {

            const confirmacion = document.getElementById("confirmacionEliminar");

            const mensaje = confirmacion
                ? confirmacion.dataset.mensaje
                : "¿Estás seguro de eliminar esta cita?";

            if (!window.confirm(mensaje)) {
                evento.preventDefault();
            }
        });
    });

    // =====================================
    // FECHA MÍNIMA Y HORARIO
    // =====================================

    const campoFecha = document.getElementById("fecha");
    const campoHora = document.getElementById("hora");

    if (campoFecha) {

        const partes = new Intl.DateTimeFormat("en-CA", {
            timeZone: "America/Mexico_City",
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
        }).formatToParts(new Date());

        const valores = {};
        partes.forEach(p => valores[p.type] = p.value);

        campoFecha.min = `${valores.year}-${valores.month}-${valores.day}`;
    }

    if (campoHora) {
        campoHora.min = "07:00";
        campoHora.max = "20:00";
        campoHora.step = "60";
    }

});
