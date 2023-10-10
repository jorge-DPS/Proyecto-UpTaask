// proteger las variables solo para este archivo; y si lo invocamos desde otro lado, dara un error (IIFE)
(function () {
    obtenerTareas();
    let tareas = [];

    // Boton para mostrar el modal de agregar tarea
    const nuevaTareaBtn = document.querySelector("#agregar-tarea");
    nuevaTareaBtn.addEventListener("click", mostrarformulario);

    async function obtenerTareas() {
        try {
            const urlSlug = obtenerProyecto();
            const url = `http://localhost:8000/api/tareas?url=${urlSlug}`;
            const respuesta = await fetch(url);
            const resultado = await respuesta.json();

            tareas = resultado.tareas;
            mostrarTareas();
        } catch (error) {
            console.log(error);
        }
    }

    function mostrarTareas() {
        // limpiar las tareas para que no se dupliquen
        limpiarTareas();
        // console.log("mostrando", tareas);
        if (tareas.length === 0) {
            const contenedorTareas = document.querySelector("#listado-tareas");

            const txtNoTareas = document.createElement("LI");
            txtNoTareas.textContent = "No hay Tareas";
            txtNoTareas.classList.add("no-tareas");

            contenedorTareas.appendChild(txtNoTareas);
            return;
        }

        const estados = {
            0: "Pendiente",
            1: "Completa",
        };

        tareas.forEach((tarea) => {
            const contenedorTarea = document.createElement("LI");
            contenedorTarea.dataset.tareaId = tarea.id;
            contenedorTarea.classList.add("tarea");

            const nombreTarea = document.createElement("P");
            nombreTarea.textContent = tarea.nombre;

            const opcionesDiv = document.createElement("DIV");
            opcionesDiv.classList.add("opciones");

            // Botones

            const btnEstadoTarea = document.createElement("BUTTON");
            btnEstadoTarea.classList.add("estado-tarea");
            btnEstadoTarea.classList.add(
                `${estados[tarea.estado].toLowerCase()}`
            );
            btnEstadoTarea.textContent = estados[tarea.estado];
            btnEstadoTarea.dataset.estadoTarea = tarea.estado;
            btnEstadoTarea.ondblclick = function () {
                cambiarEstadoTarea({ ...tarea }); // ->para evittar que modifique el areglo de tareas mando una copia de la tarea, para no modificar el array tareas; {...tarea}
            };

            const btnEliminarTarea = document.createElement("BUTTON");
            btnEliminarTarea.classList.add("eliminar-tarea");
            btnEliminarTarea.dataset.idTarea = tarea.id;
            btnEliminarTarea.textContent = "Elminar";
            btnEliminarTarea.ondblclick = function () {
                confirmarEliminarTarea({ ...tarea });
            };

            opcionesDiv.appendChild(btnEstadoTarea);
            opcionesDiv.appendChild(btnEliminarTarea);

            contenedorTarea.appendChild(nombreTarea);
            contenedorTarea.appendChild(opcionesDiv);

            const listadoTareas = document.querySelector("#listado-tareas");
            listadoTareas.appendChild(contenedorTarea);
        });
    }

    function mostrarformulario() {
        const modal = document.createElement("DIV");
        modal.classList.add("modal");
        modal.innerHTML = `
        <form class="formulario nueva-tarea">
            <legend>Añade una nueva tarea</legend>
            <div class="campo">
                <label>Tarea</label>
                <input
                    type="text"
                    name="tarea"
                    placeholder="Añadir Tarea al proyecto Actual"
                    id="tarea"
                />
            </div>
            <div class="opciones">
                <input type="submit" class="submit-nueva-tarea" value="Añadir Tarea" />
                <button type="button" class="cerrar-modal">Cancelar</button>
            </div>
        </form>
    `;
        setTimeout(() => {
            const formulario = document.querySelector(".formulario");
            formulario.classList.add("animar");
        }, 0);

        // funciones delegation; htmls no existentes, hasta qse se disparen las funciones que la crean
        modal.addEventListener("click", function (e) {
            e.preventDefault();
            if (e.target.classList.contains("cerrar-modal")) {
                const formulario = document.querySelector(".formulario");
                formulario.classList.add("cerrar");
                // animacion con set timeout
                setTimeout(() => {
                    modal.remove();
                }, 500);
            }
            if (e.target.classList.contains("submit-nueva-tarea")) {
                submitFormularioNuevaTarea();
            }
        });
        document.querySelector(".dashboard").appendChild(modal);
    }

    function submitFormularioNuevaTarea() {
        const tarea = document.querySelector("#tarea").value.trim();

        if (tarea === "") {
            // mostrar una alrta de error
            mostrarAlerta(
                "El nombre de la tarea es obligatoio",
                "error",
                document.querySelector(".formulario legend")
            );
            return;
        }
        console.log("despues del if");
        agregarTarea(tarea);
    }

    // Muestra un mensaje en la interfaz
    function mostrarAlerta(mensaje, tipo, referencia) {
        // previene la creacion de mulptiples alertas
        const alertaPrevia = document.querySelector(".alerta");
        if (alertaPrevia) {
            alertaPrevia.remove();
        }
        const alerta = document.createElement("DIV");
        alerta.classList.add("alerta", tipo);
        alerta.textContent = mensaje;

        // Inserta la alerta antes del siguiente hermano de legend
        referencia.parentElement.insertBefore(
            alerta,
            referencia.nextElementSibling
        );
        // console.log(referencia);
        // console.log(referencia.parentElement.innerBefore(referencia.nextElementSibling));
        // console.log(referencia.nextElementSibling);

        // Eliminar la alerta despues de 5 segundos
        setTimeout(() => {
            alerta.remove();
        }, 5000);
    }

    // Consultar el servidor para añadir una nueva tarea al proyecto actual
    async function agregarTarea(tarea) {
        // Construir Datos
        const datos = new FormData();
        datos.append("nombre", tarea);
        datos.append("url", obtenerProyecto());
        try {
            const url = "http://localhost:8000/api/tarea";
            const respuesta = await fetch(url, {
                method: "POST",
                body: datos,
            });

            const resultado = await respuesta.json();
            mostrarAlerta(
                resultado.mensaje,
                resultado.tipo,
                document.querySelector(".formulario legend")
            );
            console.log(resultado.tipo);
            if (resultado.tipo === "exito") {
                const modal = document.querySelector(".modal");
                setTimeout(() => {
                    modal.remove();
                }, 3000);

                // Agregar el bojeto de tarea al global de tareas
                const tareaObj = {
                    id: String(resultado.id),
                    nombre: tarea,
                    estado: 0,
                    proyectoId: resultado.proyectoId,
                };
                tareas = [...tareas, tareaObj];
                mostrarTareas();

                // console.log(tareaObj);
            }
        } catch (error) {
            console.log(error);
        }
    }

    function cambiarEstadoTarea(tarea) {
        const nuevoEstado = tarea.estado === "1" ? "0" : "1";
        tarea.estado = nuevoEstado;
        actualizarTarea(tarea);
    }

    async function actualizarTarea(tarea) {
        // la tarea es una copia {...tarea}
        const { estado, id, nombre, proyectoId } = tarea;
        const datos = new FormData();
        datos.append("id", id);
        datos.append("nombre", nombre);
        datos.append("estado", estado);
        datos.append("proyectoURL", obtenerProyecto());

        try {
            const url = "http://localhost:8000/api/tarea/actualizar";
            const respuesta = await fetch(url, {
                method: "POST",
                body: datos,
            });
            const resultado = await respuesta.json();

            console.log(resultado);

            if (resultado.respuesta.tipo === "exito") {
                console.log(resultado.respuesta.mensaje);
                mostrarAlerta(
                    resultado.respuesta.mensaje,
                    resultado.respuesta.tipo,
                    document.querySelector(".contenedor-nueva-tarea")
                );

                tareas = tareas.map((tareaMemoria) => {
                    if (tareaMemoria.id === id) {
                        tareaMemoria.estado = estado;
                    }
                    return tareaMemoria;
                });
                // console.log(tareas);
                mostrarTareas();
            }
        } catch (error) {
            console.log(error);
        }
        // console.log(tarea);
    }

    function confirmarEliminarTarea(tarea) {
        Swal.fire({
            title: "Elminar Tarea?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Si",
            cancelButtonText: "No",
        }).then((result) => {
            if (result.isConfirmed) {
                elminarTarea(tarea);
            }
        });
    }

    async function elminarTarea(tarea) {
        const { estado, id, nombre } = tarea;
        const datos = new FormData();
        datos.append("id", id);
        datos.append("nombre", nombre);
        datos.append("estado", estado);
        datos.append("proyectoURL", obtenerProyecto());
        try {
            const url = "http://localhost:8000/api/tarea/eliminar";
            const respuesta = await fetch(url, {
                method: "POST",
                body: datos,
            });

            const resultado = await respuesta.json();
            if (resultado.resultado) {
                // mostrarAlerta(
                //     resultado.mensaje,
                //     resultado.tipo,
                //     document.querySelector(".contenedor-nueva-tarea")
                // );

                Swal.fire("Elminidado", resultado.mensaje, "success");

                tareas = tareas.filter(
                    (tareaMemoria) => tareaMemoria.id !== tarea.id
                );
                mostrarTareas();
            }
        } catch (error) {
            console.log(error);
        }
    }

    function obtenerProyecto() {
        // obtenemos la url: mas propiamente el slug o la "url" de la ruta(http://localhost/proyecto?url=2d9115fc5dcf4822ae1e027755f33370) url = 2d9115fc5dcf4822ae1e027755f33370
        const proyectoParams = new URLSearchParams(window.location.search);
        const proyecto = Object.fromEntries(proyectoParams.entries());
        return proyecto.url;
    }

    function limpiarTareas() {
        const listadoTareas = document.querySelector("#listado-tareas");
        // eliminar las tareas con while, ya que es mas rapido; que ponerle un innerhtml
        while (listadoTareas.firstChild) {
            listadoTareas.removeChild(listadoTareas.firstChild);
        }
    }
})();
