<?php
class ClientesModel {

    private $archivo;

    public function __construct(){
        $this->archivo = __DIR__ . "/../data/clientes.json";
    }

    public function obtener(){
        if(!file_exists($this->archivo)){
            return [];
        }
        return json_decode(file_get_contents($this->archivo), true) ?? [];
    }

    public function guardar($nuevo){
        $datos = $this->obtener();
        $datos[] = $nuevo;
        file_put_contents($this->archivo, json_encode($datos, JSON_PRETTY_PRINT));
    }

    public function eliminar($folio){
        $datos = array_filter($this->obtener(), fn($c) => $c['folio'] != $folio);
        file_put_contents($this->archivo, json_encode(array_values($datos), JSON_PRETTY_PRINT));
    }

    public function actualizar($folio, $nuevo){
        $datos = $this->obtener();

        foreach($datos as $i => $c){
            if($c['folio'] === $folio){
                $datos[$i] = $nuevo;
                break;
            }
        }

        file_put_contents($this->archivo, json_encode($datos, JSON_PRETTY_PRINT));
    }

    public function buscar($valor){
        $clientes = $this->obtener();
        $resultado = [];

        foreach($clientes as $c){
            if(
                stripos($c['folio'], $valor) !== false ||
                stripos($c['curp'], $valor) !== false
            ){
                $resultado[] = $c;
            }
        }

        return $resultado;
    }
}