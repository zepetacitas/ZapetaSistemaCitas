
<?php
require_once __DIR__ . "/ApiMongoClient.php";

class EmpleadosModel {

    private $ruta = "/api/empleados";

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
        $empleados = $this->obtener();
        $resultado = [];

        foreach($empleados as $empleado){

            if(!is_array($empleado)) continue;

            if(
                stripos((string)($empleado['folio'] ?? ''), $valor) !== false ||
                stripos((string)($empleado['curp'] ?? ''), $valor) !== false
            ){
                $resultado[] = $empleado;
            }
        }

        return $resultado;
    }
}
