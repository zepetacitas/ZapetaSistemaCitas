<?php
require_once __DIR__ . "/../models/SociosModel.php";

class SociosController {

    public function index(){

        $modelo = new SociosModel();

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

                $socios = $modelo->obtener();
                $contador = 1;

                foreach($socios as $c){
                    if(is_array($c) && strpos($c['folio'] ?? '', $prefijo) === 0){
                        $contador++;
                    }
                }

                $folio = $prefijo . "-" . str_pad($contador, 3, "0", STR_PAD_LEFT);
            }

            $socio = [
                "folio" => $folio,
                "nombre" => $_POST['nombre'] ?? '',
                "apellido" => $_POST['apellido'] ?? '',
                "curp" => $_POST['curp'] ?? '',
                "sexo" => $_POST['sexo'] ?? '',
                "fecha_nacimiento" => $_POST['fecha_nacimiento'] ?? '',
                "domicilio" => $_POST['domicilio'] ?? '',
                "telefono" => $_POST['telefono'] ?? '',
                "servicio" => $_POST['servicio'] ?? ''
            ];

            //GUARDAR O ACTUALIZAR
            if(!empty($_POST['folio'])){
                $modelo->actualizar($folio, $socio);
            } else {
                $modelo->guardar($socio);
            }

            header("Location: index.php?modulo=socios");
            exit;
        }

        // =========================
        // ELIMINAR
        // =========================
        if(isset($_GET['eliminar'])){
            $modelo->eliminar($_GET['eliminar']);
            header("Location: index.php?modulo=socios");
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

        // =========================
        // MOSTRAR DATOS
        // =========================
        $datos = $modelo->obtener();

        require_once __DIR__ . "/../views/socios/socios.php";
    }

    // =========================
    // BUSCAR
    // =========================
    public function buscar(){

        $modelo = new SociosModel();

        $valor = $_POST['buscar'] ?? '';
        $datos = $modelo->buscar($valor);

        $editar = null;

        require_once __DIR__ . "/../views/socios/socios.php";
    }
}