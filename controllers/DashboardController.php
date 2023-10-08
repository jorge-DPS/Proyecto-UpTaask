<?php

namespace Controllers;

use Model\Proyecto;
use MVC\Router;

class DashboardController
{
    public static function index(Router $router)
    {
        session_start();
        estaAutenticado();

        $id = $_SESSION['id'];
        $proyectos = Proyecto::perteneceA('propietarioId', $id);


        $router->render('dashboard/index', [
            'titulo' => 'Proyectos',
            'proyectos' => $proyectos,
        ]);
    }

    public static function crear_proyecto(Router $router)
    {
        session_start();
        estaAutenticado();
        $alertas = [];

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $proyecto = new Proyecto($_POST);

            // Validacion
            $alertas = $proyecto->validarProyecto();

            if (empty($alertas)) {
                // Generar una URL unica
                $proyecto->url = md5(uniqid());

                // Almacenar el creardor del proyecto
                $proyecto->propietarioId = $_SESSION['id'];

                // Guardar el proyecto
                $proyecto->guardar();

                // Redireccionar
                header('Location: /proyectos?url=' . $proyecto->url);
            }
        }

        $router->render('dashboard/crear-proyecto', [
            'titulo' => 'Crear Proyecto',
            'alertas' => $alertas,
        ]);
    }

    public static function proyecto(Router $router)
    {
        session_start();
        estaAutenticado();

        $url = $_GET['url'];

        if (!$url) {
            header('Location: /dashboard');
        }

        // Revisar que la persona que visita el proyecto, es quien lo creo
        $proyecto = Proyecto::where('url', $url);
        if ($proyecto->propietarioId !== $_SESSION['id']) {
            header('Location: /dashboard');
        }

        $router->render('dashboard/proyecto', [
            'titulo' => $proyecto->proyecto,
        ]);
    }

    public static function perfil(Router $router)
    {
        session_start();
        $router->render('dashboard/perfil', [
            'titulo' => 'Perfil',
        ]);
    }
}
