
<?php
require_once __DIR__ . "/ApiMongoClient.php";

class SociosModel {

    private $ruta = "/api/socios";

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
        $socios = $this->obtener();
        $resultado = [];

        foreach($socios as $socio){

            if(!is_array($socio)) continue;

            if(
                stripos((string)($socio['folio'] ?? ''), $valor) !== false ||
                stripos((string)($socio['curp'] ?? ''), $valor) !== false
            ){
                $resultado[] = $socio;
            }
        }

        return $resultado;
    }
}
