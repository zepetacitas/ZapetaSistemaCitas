<?php
require_once __DIR__ . "/../models/PacientesModel.php";

class PacientesController {

    public function index(){

        $modelo = new PacientesModel();

        // =========================
        // GUARDAR / ACTUALIZAR
        // =========================
        if(isset($_POST['guardar'])){

            //ACTUALIZA FOLIO
            if(!empty($_POST['folio'])){
                $folio = $_POST['folio'];
            } else {

                // ===== GENERAR FOLIO =====
                $apellido = strtoupper(trim($_POST['apellido']));
                $letras = substr($apellido, 0, 2);
                $fecha = date("Ymd");

                $prefijo = $letras . $fecha;

                $pacientes = $modelo->obtener();
                $contador = 1;

                foreach($pacientes as $c){
                    if(is_array($c) && strpos($c['folio'] ?? '', $prefijo) === 0){
                        $contador++;
                    }
                }

                $folio = $prefijo . "-" . str_pad($contador, 3, "0", STR_PAD_LEFT);
            }

            $paciente = [
                "folio" => $folio,
                "nombre" => $_POST['nombre'],
                "apellido" => $_POST['apellido'],
                "curp" => $_POST['curp'],
                "sexo" => $_POST['sexo'],
                "fecha_nacimiento" => $_POST['fecha_nacimiento'],
                "domicilio" => $_POST['domicilio'],
                "telefono" => $_POST['telefono'],
                "servicio" => $_POST['servicio']
            ];

            if(!empty($_POST['folio'])){
                $modelo->actualizar($folio, $paciente);
            } else {
                $modelo->guardar($paciente);
            }

            header("Location: index.php?modulo=pacientes");
            exit;
        }

        // =========================
        // ELIMINAR
        // =========================
        if(isset($_GET['eliminar'])){
            $modelo->eliminar($_GET['eliminar']);
            header("Location: index.php?modulo=pacientes");
            exit;
        }

        // =========================
        // EDITAR
        // =========================
        $editar = null;

        if(isset($_GET['editar'])){
            foreach($modelo->obtener() as $c){
                if(is_array($c) && ($c['folio'] ?? '') == $_GET['editar']){
                    $editar = $c;
                    break;
                }
            }
        }

        $datos = $modelo->obtener();

        require_once __DIR__ . "/../views/pacientes/pacientes.php";
    }

    public function buscar(){
        $modelo = new PacientesModel();
        $valor = $_POST['buscar'] ?? '';
        $datos = $modelo->buscar($valor);
        $editar = null;

        require_once __DIR__ . "/../views/pacientes/pacientes.php";
    }
}