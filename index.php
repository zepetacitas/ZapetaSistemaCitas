<?php

// ======================================================
// PDF
// ======================================================
if(isset($_GET['pdf'])){
    require_once "controllers/PdfController.php";
    $pdf = new PdfController();
    $pdf->generar();
    exit;
}


// ======================================================
// BASE URL DEL SISTEMA PHP
// ======================================================
if(!defined('BASE_URL')){
    define('BASE_URL', 'http://localhost:8000/');
}


// ======================================================
// MÓDULO SOLICITADO
// ======================================================
$modulo = $_GET['modulo'] ?? null;


// ======================================================
// MENÚ PRINCIPAL
// ======================================================
if($modulo === null){
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Sistema Zepeta</title>

    <!-- CSS -->
    <link rel="stylesheet"
          href="<?php echo BASE_URL; ?>public/css/estilos.css?v=<?php echo time(); ?>">
</head>

<body>

<div class="logo">

    <!-- Logotipo -->
    <img src="<?php echo BASE_URL; ?>public/img/logo.png"
         alt="Logo">

</div>


<div class="menu">

    <!-- ==================================================
         CLIENTES - PHP
         ================================================== -->
    <a href="<?php echo BASE_URL; ?>index.php?modulo=clientes"
       class="card">

        <div class="icono-circulo">

            <img src="<?php echo BASE_URL; ?>public/img/clientes.png"
                 alt="Clientes">

        </div>

        <h3>Clientes</h3>

    </a>


    <!-- ==================================================
         PACIENTES - PHP
         ================================================== -->
    <a href="<?php echo BASE_URL; ?>index.php?modulo=pacientes"
       class="card">

        <div class="icono-circulo">

            <img src="<?php echo BASE_URL; ?>public/img/pacientes.png"
                 alt="Pacientes">

        </div>

        <h3>Pacientes</h3>

    </a>


    <!-- ==================================================
         EMPLEADOS - PHP
         ================================================== -->
    <a href="<?php echo BASE_URL; ?>index.php?modulo=empleados"
       class="card">

        <div class="icono-circulo">

            <img src="<?php echo BASE_URL; ?>public/img/empleados.png"
                 alt="Empleados">

        </div>

        <h3>Empleados</h3>

    </a>


    <!-- ==================================================
         SOCIOS - PHP
         ================================================== -->
    <a href="<?php echo BASE_URL; ?>index.php?modulo=socios"
       class="card">

        <div class="icono-circulo">

            <img src="<?php echo BASE_URL; ?>public/img/socios.png"
                 alt="Socios">

        </div>

        <h3>Socios</h3>

    </a>


    <!-- ==================================================
         CITAS - NODE.JS + MONGODB ATLAS
         ================================================== -->
    <a href="http://localhost:3000/citas"
       class="card">

        <div class="icono-circulo">

            <img src="<?php echo BASE_URL; ?>public/img/citas.png"
                 alt="Citas">

        </div>

        <h3>Citas</h3>

    </a>

</div>

</body>
</html>


<?php

// ======================================================
// CARGA DE MÓDULOS PHP
// ======================================================
}else{

    /*
     * IMPORTANTE:
     *
     * Citas YA NO SE PROCESA AQUÍ.
     *
     * Citas funciona mediante Node.js.
     *
     * Si alguien entra manualmente a:
     *
     * index.php?modulo=citas
     *
     * lo mandamos al módulo Node.js.
     */

    if($modulo === 'citas'){

        header("Location: http://localhost:3000/citas");
        exit;

    }


    // ==================================================
    // LOS DEMÁS MÓDULOS CONTINÚAN FUNCIONANDO EN PHP
    // ==================================================

    $archivo = "controllers/" . ucfirst($modulo) . "Controller.php";


    if(file_exists($archivo)){

        require_once $archivo;

        $clase = ucfirst($modulo) . "Controller";

        $controller = new $clase();


        // ==================================================
        // ACCIONES
        // ==================================================

        if(
            isset($_POST['guardar']) &&
            method_exists($controller, 'guardar')
        ){

            $controller->guardar();


        }elseif(
            isset($_POST['buscar']) &&
            method_exists($controller, 'buscar')
        ){

            $controller->buscar();


        }elseif(
            isset($_GET['eliminar']) &&
            method_exists($controller, 'eliminar')
        ){

            $controller->eliminar();


        }elseif(
            isset($_POST['actualizar']) &&
            method_exists($controller, 'actualizar')
        ){

            $controller->actualizar();


        }else{

            $controller->index();

        }


    }else{

        echo "
            <h2 style='text-align:center;'>
                Módulo no encontrado
            </h2>
        ";

    }

}
?>