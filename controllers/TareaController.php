<?php

namespace Controllers;

use Model\Proyecto;
use Model\Tarea;

class TareaController
{
    public static function index()
    {
        $proyectoURL = $_GET['url'];
        if (!$proyectoURL) {
            header('Location: /dashboard');
        }
        $proyecto = Proyecto::where('url', $proyectoURL);
        session_start();
        if (!$proyecto || $proyecto->propietarioId !== $_SESSION['id']) {
            header('Location: /404');
        }
        $tareas = Tarea::perteneceA('proyectoId', $proyecto->id);
        echo json_encode(['tareas' => $tareas]);
    }

    public static function crear()
    {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            session_start();
            $propietario = $_SESSION['id'];

            $proyectoURL = $_POST['url'];
            $proyecto = Proyecto::where('url', $proyectoURL);
            if (!$proyecto || $proyecto->propietarioId !== $propietario) {
                $respuesta = [
                    'tipo' => 'error',
                    'mensaje' => 'Hubo un error al agregar la tarea'
                ];

                echo json_encode($respuesta);
                return;
            }

            // Todo bien, instanciar y crear la tarea
            $tarea = new Tarea($_POST);
            $tarea->proyectoId = $proyecto->id;
            $resultado = $tarea->guardar();
            $respuesta = [
                'tipo' => 'exito',
                'id' => $resultado['id'],
                'mensaje' => 'Tarea Creada Correctamente',
                'proyectoId' => $proyecto->id,
            ];
            echo json_encode($respuesta);
        }
    }

    public static function actualizar()
    {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        }
    }

    public static function eliminar()
    {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        }
    }
}
