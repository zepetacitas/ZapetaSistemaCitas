<?php

require_once __DIR__ . "/ApiMongoClient.php";

class ClientesModel {

    private $ruta = "/api/clientes";

    // ========================================
    // CONVERTIR RESPUESTA DE NODE.JS
    // ========================================

    private function convertirDatos($respuesta) {

        if (
            !isset($respuesta->datos) ||
            !is_array($respuesta->datos)
        ) {
            return [];
        }

        return json_decode(
            json_encode($respuesta->datos),
            true
        ) ?? [];
    }

    // ========================================
    // OBTENER TODOS LOS CLIENTES
    // ========================================

    public function obtener() {

        $respuesta = ApiMongoClient::obtener(
            $this->ruta
        );

        return $this->convertirDatos($respuesta);
    }

    // ========================================
    // GUARDAR CLIENTE
    // ========================================

    public function guardar($nuevo) {

        return ApiMongoClient::guardar(
            $this->ruta,
            $nuevo
        );
    }

    // ========================================
    // ELIMINAR CLIENTE
    // ========================================

    public function eliminar($folio) {

        return ApiMongoClient::eliminar(
            $this->ruta,
            $folio
        );
    }

    // ========================================
    // ACTUALIZAR CLIENTE
    // ========================================

    public function actualizar($folio, $nuevo) {

        return ApiMongoClient::actualizar(
            $this->ruta,
            $folio,
            $nuevo
        );
    }

    // ========================================
    // BUSCAR POR FOLIO O CURP
    // ========================================

    public function buscar($valor) {

        if (trim($valor) === "") {
            return [];
        }

        $rutaBusqueda = $this->ruta
            . "/buscar?valor="
            . rawurlencode($valor);

        $respuesta = ApiMongoClient::obtener(
            $rutaBusqueda
        );

        return $this->convertirDatos($respuesta);
    }
}
