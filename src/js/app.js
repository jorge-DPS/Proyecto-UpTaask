const mobileMenu = document.querySelector(".menu");
const cerrarMenuBtn = document.querySelector("#cerrar-menu");
const sidebar = document.querySelector(".sidebar");
const mediaqueryList = window.matchMedia("(min-width: 768px)");

if (mobileMenu) {
    mobileMenu.addEventListener("click", function () {
        sidebar.classList.toggle("mostrar");
    });
}

if (cerrarMenuBtn) {
    cerrarMenuBtn.addEventListener("click", function () {
        sidebar.classList.add("ocultar");
        setTimeout(() => {
            sidebar.classList.remove("mostrar");
            sidebar.classList.remove("ocultar");
        }, 100);
    });
}

// Elmina la clase de mostrar, en un tamaño e tablet y mayores
mediaqueryList.addEventListener("change", function (e) {
    console.log("Ejecutado el listener", e.target.matches);
    const mostrar = document.querySelector(".mostrar");
    // console.log(mostrar);
    // console.log(e);
    if (mostrar && e.target.matches == true) {
        mostrar.classList.remove("mostrar");
    }
});
