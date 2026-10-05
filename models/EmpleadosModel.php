<?php
class EmpleadosModel {

    private $archivo;

    public function __construct(){
        $this->archivo = __DIR__ . "/../data/empleados.json";
    }

    public function obtener(){
        if(!file_exists($this->archivo)){
            return [];
        }

        $datos = json_decode(file_get_contents($this->archivo), true);

        return array_filter($datos ?? [], fn($c) => is_array($c));
    }

    public function guardar($nuevo){
        $datos = $this->obtener();
        $datos[] = $nuevo;

        file_put_contents($this->archivo, json_encode($datos, JSON_PRETTY_PRINT));
    }

    public function eliminar($folio){
        $datos = array_filter($this->obtener(), function($c) use ($folio){
            return is_array($c) && ($c['folio'] ?? '') != $folio;
        });

        file_put_contents($this->archivo, json_encode(array_values($datos), JSON_PRETTY_PRINT));
    }

    public function actualizar($folio, $nuevo){
        $datos = $this->obtener();

        foreach($datos as $i => $c){
            if(is_array($c) && ($c['folio'] ?? '') === $folio){
                $datos[$i] = $nuevo;
                break;
            }
        }

        file_put_contents($this->archivo, json_encode($datos, JSON_PRETTY_PRINT));
    }

    public function buscar($valor){
        $empleados = $this->obtener();
        $resultado = [];

        foreach($empleados as $c){

            if(!is_array($c)) continue;

            if(
                stripos($c['folio'] ?? '', $valor) !== false ||
                stripos($c['curp'] ?? '', $valor) !== false
            ){
                $resultado[] = $c;
            }
        }

        return $resultado;
    }
}