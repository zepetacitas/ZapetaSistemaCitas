<?php

// ======================================================
// CONFIGURACIÓN DE URL
// ======================================================

// URL pública del servicio PHP en Render
if (!defined('BASE_URL')) {
    $appUrl = getenv('APP_URL')
        ?: 'https://zapetasistemacitas.onrender.com';

    define('BASE_URL', rtrim($appUrl, '/') . '/');
}

// URL pública del servicio Node.js en Render
if (!defined('CITAS_URL')) {
   $nodeUrl = getenv('CITAS_URL')
    ?: 'https://zapetasistemacitas-1.onrender.com';

    define('CITAS_URL', rtrim($nodeUrl, '/'));
}

// ======================================================
// PDF
// ======================================================

if (isset($_GET['pdf'])) {
    require_once "controllers/PdfController.php";

    $pdf = new PdfController();
    $pdf->generar();

    exit;
}

// ======================================================
// MÓDULO SOLICITADO
// ======================================================

$modulo = $_GET['modulo'] ?? null;

// ======================================================
// MENÚ PRINCIPAL
// ======================================================

if ($modulo === null) {
?>

<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Sistema Zepeta</title>

    <link rel="stylesheet"
          href="<?php echo BASE_URL; ?>public/css/estilos.css">
</head>

<body>

<div class="logo">

    <img
        src="<?php echo BASE_URL; ?>public/img/logo.png"
        alt="Logo"
    >

</div>

<div class="menu">

    <!-- CLIENTES -->

    <a href="<?php echo BASE_URL; ?>index.php?modulo=clientes"
       class="card">

        <div class="icono-circulo">

            <img
                src="<?php echo BASE_URL; ?>public/img/clientes.png"
                alt="Clientes"
            >

        </div>

        <h3>Clientes</h3>

    </a>

    <!-- PACIENTES -->

    <a href="<?php echo BASE_URL; ?>index.php?modulo=pacientes"
       class="card">

        <div class="icono-circulo">

            <img
                src="<?php echo BASE_URL; ?>public/img/pacientes.png"
                alt="Pacientes"
            >

        </div>

        <h3>Pacientes</h3>

    </a>

    <!-- EMPLEADOS -->

    <a href="<?php echo BASE_URL; ?>index.php?modulo=empleados"
       class="card">

        <div class="icono-circulo">

            <img
                src="<?php echo BASE_URL; ?>public/img/empleados.png"
                alt="Empleados"
            >

        </div>

        <h3>Empleados</h3>

    </a>

    <!-- SOCIOS -->

    <a href="<?php echo BASE_URL; ?>index.php?modulo=socios"
       class="card">

        <div class="icono-circulo">

            <img
                src="<?php echo BASE_URL; ?>public/img/socios.png"
                alt="Socios"
            >

        </div>

        <h3>Socios</h3>

    </a>

    <!-- CITAS: NODE.JS -->

    <a href="<?php echo CITAS_URL; ?>/citas"
       class="card">

        <div class="icono-circulo">

            <img
                src="<?php echo BASE_URL; ?>public/img/citas.png"
                alt="Citas"
            >

        </div>

        <h3>Citas</h3>

    </a>

</div>

</body>
</html>

<?php

// ======================================================
// MÓDULOS PHP
// ======================================================

} else {

    // ==================================================
    // CITAS: REDIRECCIÓN A NODE.JS
    // ==================================================

    if ($modulo === 'citas') {

        header("Location: " . CITAS_URL . "/citas");
        exit;

    }

    // ==================================================
    // VALIDAR NOMBRE DEL MÓDULO
    // ==================================================

    $modulosPermitidos = [
        'clientes',
        'pacientes',
        'empleados',
        'socios'
    ];

    if (!in_array($modulo, $modulosPermitidos, true)) {

        http_response_code(404);

        echo "<h2 style='text-align:center;'>Módulo no encontrado</h2>";

        exit;
    }

    // ==================================================
    // CARGAR CONTROLADOR
    // ==================================================

    $archivo = "controllers/" . ucfirst($modulo) . "Controller.php";

    if (file_exists($archivo)) {

        require_once $archivo;

        $clase = ucfirst($modulo) . "Controller";

        if (!class_exists($clase)) {

            throw new RuntimeException(
                "No se encontró el controlador: " . $clase
            );

        }

        $controller = new $clase();

        // ==============================================
        // ACCIONES
        // ==============================================

        if (
            isset($_POST['guardar']) &&
            method_exists($controller, 'guardar')
        ) {

            $controller->guardar();

        } elseif (
            isset($_POST['buscar']) &&
            method_exists($controller, 'buscar')
        ) {

            $controller->buscar();

        } elseif (
            isset($_GET['eliminar']) &&
            method_exists($controller, 'eliminar')
        ) {

            $controller->eliminar();

        } elseif (
            isset($_POST['actualizar']) &&
            method_exists($controller, 'actualizar')
        ) {

            $controller->actualizar();

        } else {

            $controller->index();

        }

    } else {

        http_response_code(404);

        echo "<h2 style='text-align:center;'>Controlador no encontrado</h2>";

    }

}

?>
