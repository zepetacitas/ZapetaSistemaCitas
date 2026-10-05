<?php
require_once __DIR__ . "/../models/ClientesModel.php";

class ClientesController {

    public function index(){

        $modelo = new ClientesModel();

        // =========================
        // GUARDAR / ACTUALIZAR
        // =========================
        if(isset($_POST['guardar'])){

            //SI VIENE FOLIO ACTUALIZA
            if(!empty($_POST['folio'])){
                $folio = $_POST['folio'];
            } else {

                // ===== GENERAR FOLIO =====
                $apellido = strtoupper(trim($_POST['apellido']));
                $letras = substr($apellido, 0, 2);
                $fecha = date("Ymd");

                $prefijo = $letras . $fecha;

                $clientes = $modelo->obtener();
                $contador = 1;

                foreach($clientes as $c){
                    if(strpos($c['folio'], $prefijo) === 0){
                        $contador++;
                    }
                }

                $folio = $prefijo . "-" . str_pad($contador, 3, "0", STR_PAD_LEFT);
            }

            $cliente = [
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
                $modelo->actualizar($folio, $cliente); //  ACTUALIZA
            } else {
                $modelo->guardar($cliente); // CREA
            }

            header("Location: index.php?modulo=clientes");
            exit;
        }

        // =========================
        // ELIMINAR
        // =========================
        if(isset($_GET['eliminar'])){
            $modelo->eliminar($_GET['eliminar']);
            header("Location: index.php?modulo=clientes");
            exit;
        }

        // =========================
        // EDITAR
        // =========================
        $editar = null;

        if(isset($_GET['editar'])){
            foreach($modelo->obtener() as $c){
                if($c['folio'] == $_GET['editar']){
                    $editar = $c;
                    break;
                }
            }
        }

        $datos = $modelo->obtener();

        require_once __DIR__ . "/../views/clientes/clientes.php";
    }

    public function buscar(){
        $modelo = new ClientesModel();
        $valor = $_POST['buscar'] ?? '';
        $datos = $modelo->buscar($valor);
        $editar = null;

        require_once __DIR__ . "/../views/clientes/clientes.php";
    }
}