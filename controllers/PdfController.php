<?php
require_once __DIR__ . "/../models/ClientesModel.php";
require_once __DIR__ . "/../models/PacientesModel.php";
require_once __DIR__ . "/../models/EmpleadosModel.php";
require_once __DIR__ . "/../models/SociosModel.php";
require_once __DIR__ . "/../models/CitasModel.php";

class PdfController {

    public function generar(){

        //Detectar módulo
        $modulo = $_GET['modulo'] ?? 'clientes';

        date_default_timezone_set('America/Mexico_City');
        $fecha = date("d/m/Y H:i");

        // =========================
        // CLIENTES
        // =========================
        if($modulo == "clientes"){

            $modelo = new ClientesModel();
            $datos = $modelo->obtener();

            require_once __DIR__ . "/../views/clientes/pdf.php";
        }

        // =========================
        // PACIENTES
        // =========================
        elseif($modulo == "pacientes"){

            $modelo = new PacientesModel();
            $datos = $modelo->obtener();

            require_once __DIR__ . "/../views/pacientes/pdf.php";
        }

        // =========================
        // EMPLEADOS
        // =========================
        elseif($modulo == "empleados"){

            $modelo = new EmpleadosModel();
            $datos = $modelo->obtener();

            require_once __DIR__ . "/../views/empleados/pdf.php";
        }

        // =========================
        // SOCIOS
        // =========================
        elseif($modulo == "socios"){

            $modelo = new SociosModel();
            $datos = $modelo->obtener();

            require_once __DIR__ . "/../views/socios/pdf.php";
        }

        // =========================
        // CITAS
        // =========================
        elseif($modulo == "citas"){

            $modelo = new CitasModel();
            $datos = $modelo->obtener();

            require_once __DIR__ . "/../views/citas/pdf.php";
        }
    }
}