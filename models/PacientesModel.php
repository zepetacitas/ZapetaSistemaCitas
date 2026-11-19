<?php
require_once __DIR__ . "/ApiMongoClient.php";

class PacientesModel {

    private $ruta = "/api/pacientes";

    public function obtener(){
        $respuesta = ApiMongoClient::obtener($this->ruta);

        $datos = $respuesta->datos ?? [];

        return json_decode(json_encode($datos), true) ?? [];
    }

    public function guardar($nuevo){
        return ApiMongoClient::guardar($this->ruta, $nuevo);
    }

    public function eliminar($folio){
        return ApiMongoClient::eliminar($this->ruta, $folio);
    }

    public function actualizar($folio, $nuevo){
        return ApiMongoClient::actualizar($this->ruta, $folio, $nuevo);
    }

    public function buscar($valor){
        $pacientes = $this->obtener();
        $resultado = [];

        foreach($pacientes as $paciente){

            if(!is_array($paciente)) continue;

            if(
                stripos((string)($paciente['folio'] ?? ''), $valor) !== false ||
                stripos((string)($paciente['curp'] ?? ''), $valor) !== false
            ){
                $resultado[] = $paciente;
            }
        }

        return $resultado;
    }
}
