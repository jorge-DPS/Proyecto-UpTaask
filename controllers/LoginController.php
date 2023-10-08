<?php

namespace Controllers;

use Classes\Email;
use Model\Usuario;
use MVC\Router;

class LoginController
{
    public static function login(Router $router)
    {
        $alertas = [];
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $usuario = new Usuario($_POST);
            $alertas = $usuario->validarLogin();

            if (empty($alertas)) {
                // Verificar que el usuario exista
                $usuario = Usuario::where('email', $usuario->email);
                if (!$usuario || $usuario->confirmado === '0') {
                    Usuario::setAlerta('error', 'El Usuario no existe, o no esta Confirmado');
                } else {
                    // El usuario existe
                    if (password_verify($_POST['password'], $usuario->password)) {
                        // Iniciar sesión
                        session_start();
                        $_SESSION['id'] = $usuario->id;
                        $_SESSION['nombre'] = $usuario->nombre;
                        $_SESSION['email'] = $usuario->email;
                        $_SESSION['login'] = true;

                        // Redireccionar
                        header('Location:/dashboard');
                    } else {
                        Usuario::setAlerta('error', 'Password Incorrecto');
                    }
                }
            }
        }

        $alertas = Usuario::getAlertas();

        // Render a la vista
        $router->render('auth/login', [
            'titulo' => 'Iniciar Sesión',
            'alertas' => $alertas,
        ]);
    }

    public static function logout()
    {
        // echo "desde Logout";
        session_start();
        $_SESSION = [];
        header('Location: /');
    }

    public static function crear(Router $router)
    {
        // echo "desde crear";
        $alertas = [];
        $usuario = new Usuario;
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $usuario->sincronizar($_POST);
            // debuguear($usuario);
            $alertas = $usuario->validarNuevaCuenta();

            $existeUsuario = Usuario::where('email', $usuario->email);
            if (empty($alertas)) {
                if ($existeUsuario) {
                    Usuario::setAlerta('error', 'El Usuario ya esta registrado');
                    $alertas = Usuario::getAlertas();
                } else {

                    // Hashear password
                    $usuario->encriptarPassword();

                    // Eliminar un elemento del objeto 
                    unset($usuario->password2);

                    // Genear el token
                    $usuario->crearToken();

                    // Crear al usuario
                    $resultado = $usuario->guardar();

                    // Enviar email
                    $email = new Email($usuario->email, $usuario->nombre, $usuario->token);
                    $email->enviarConfirmacion();
                    if ($resultado) {
                        // si hay un resultado redireccionar  al usuario
                        header('Location: /mensaje');
                    }
                }
            }
        }
        // renderiza la vista html
        $router->render('auth/crear', [
            'titulo' => 'Crea una Cuenta en UpTask',
            'usuario' => $usuario,
            'alertas' => $alertas,
        ]);
    }

    public static function olvide(Router $router)
    {
        // echo "desde olvide";
        $alertas = [];
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $usuario = new Usuario($_POST);
            $alertas = $usuario->validarEmail();
            if (empty($alertas)) {
                // Buscar al ususario en el DB
                $usuario = Usuario::where('email', $usuario->email);

                if ($usuario && $usuario->confirmado === '1') {
                    // debuguear('existe y esta confirmado');
                    // Encontre al Usuario

                    // generar un nuevo token
                    $usuario->crearToken();
                    unset($usuario->password2);

                    // Actualizar el usuario
                    $usuario->guardar();

                    // Enviar el email
                    $email = new Email($usuario->email, $usuario->nombre, $usuario->token);
                    $email->enviarInstrucciones();

                    // Imprimir la alerta
                    Usuario::setAlerta('exito', 'Hemos enviado las instrucciones a tu Email');
                } else {
                    Usuario::setAlerta('error', 'El usuario no existe o no esta confirmado');
                }
            }
        }

        $alertas = Usuario::getAlertas();
        $router->render('auth/olvide', [
            'titulo' => 'Recuperar Password',
            'alertas' => $alertas

        ]);
    }

    public static function reestablecer(Router $router)
    {
        // echo "desde reestablecer";
        $alertas = [];
        $mostrar = true;
        $token = s($_GET['token']);
        if (!$token) {
            header('Location: /');
        }

        // identificar al usuario con este token
        $usuario = Usuario::where('token', $token);
        if (empty($usuario)) {
            Usuario::setAlerta('error', 'Token no Válido');
            $mostrar = false;
        }
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            // Añadir el nuevo password
            $usuario->sincronizar($_POST);

            // Validar Password
            $usuario->validarPassword();

            if (empty($alertas)) {
                // Encriptar el nuevo password
                $usuario->encriptarPassword();

                // Eliminar el token
                $usuario->token = null;

                // Guardar el usuario en la DB
                $resultado = $usuario->guardar();

                // Redireccionar
                if ($resultado) {
                    header('Location: /');
                }
            }
        }

        $alertas = Usuario::getAlertas();
        // Muestra la Vista
        $router->render('auth/reestablecer', [
            'titulo' => 'Reetablecer Password',
            'alertas' => $alertas,
            'mostrar' => $mostrar,
        ]);
    }

    public static function mensaje(Router $router)
    {
        // echo "desde mensaje";
        $router->render('auth/mensaje', [
            'titulo' => 'Cuenta creada Exitosamente'
        ]);
    }

    public static function confirmar(Router $router)
    {
        // echo "desde confirmar";
        $token = s($_GET['token']);
        if (!$token) {
            header('Location: /');
        }

        $usuario = Usuario::where('token', $token);

        if (empty($usuario)) {
            // no se encontro al usuario con ese token
            Usuario::setAlerta('error', 'token no Válido');
        } else {
            // Confirmar la cuenta
            $usuario->confirmado = 1;
            $usuario->token = null;
            unset($usuario->password2);

            //Guardar en la DB
            $usuario->guardar();

            Usuario::setAlerta('exito', 'Cuenta Confirmada Correctamente');
        }
        $alertas = Usuario::getAlertas();

        $router->render('auth/confirmar', [
            'titulo' => 'Confirma tu Cuenta UpTask',
            'alertas' => $alertas,
        ]);
    }
}
