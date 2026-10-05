<?php
require_once __DIR__ . "/../models/EmpleadosModel.php";

class EmpleadosController {

    public function index(){

        $modelo = new EmpleadosModel();

        // =========================
        // GUARDAR / ACTUALIZAR
        // =========================
        if(isset($_POST['guardar'])){

            // ACTUALIZA EL FOLIO
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

                foreach($empleados as $c){
                    if(is_array($c) && strpos($c['folio'] ?? '', $prefijo) === 0){
                        $contador++;
                    }
                }

                $folio = $prefijo . "-" . str_pad($contador, 3, "0", STR_PAD_LEFT);
            }

            $empleado = [
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
                $modelo->actualizar($folio, $empleado);
            } else {
                $modelo->guardar($empleado);
            }

            header("Location: index.php?modulo=empleados");
            exit;
        }

        // =========================
        // ELIMINAR
        // =========================
        if(isset($_GET['eliminar'])){
            $modelo->eliminar($_GET['eliminar']);
            header("Location: index.php?modulo=empleados");
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

        require_once __DIR__ . "/../views/empleados/empleados.php";
    }

    public function buscar(){
        $modelo = new EmpleadosModel();
        $valor = $_POST['buscar'] ?? '';
        $datos = $modelo->buscar($valor);
        $editar = null;

        require_once __DIR__ . "/../views/empleados/empleados.php";
    }
}