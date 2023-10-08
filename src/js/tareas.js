// proteger las variables solo para este archivo; y si lo invocamos desde otro lado, dara un error (IIFE)
(function () {
    // Boton para mostrar el modal de agregar tarea
    const nuevaTareaBtn = document.querySelector("#agregar-tarea");
    nuevaTareaBtn.addEventListener("click", mostrarformulario);

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
                <input type="submit" class="submit-nueva-tarea" value="Añadir Tarea"/>
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
        });
        document.querySelector("body").appendChild(modal);
    }
})();
