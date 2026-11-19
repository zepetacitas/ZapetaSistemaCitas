<?php
require_once __DIR__ . "/../config/api.php";

class ApiMongoClient {

    /**
     * Ejecuta solicitudes HTTP hacia Node.js.
     */
    public static function solicitar(
        $metodo,
        $ruta,
        $datos = null
    ) {

        if (!function_exists("curl_init")) {
            throw new RuntimeException(
                "La extensión cURL de PHP no está habilitada."
            );
        }

        $url = NODE_API_URL . "/" . ltrim($ruta, "/");

        $ch = curl_init($url);

        if ($ch === false) {
            throw new RuntimeException(
                "No fue posible iniciar la conexión cURL."
            );
        }

        $encabezados = [
            "X-API-Key: " . NODE_API_KEY,
            "Accept: application/json"
        ];

        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CUSTOMREQUEST => strtoupper($metodo),
            CURLOPT_HTTPHEADER => $encabezados,
            CURLOPT_CONNECTTIMEOUT => 10,
            CURLOPT_TIMEOUT => 30
        ]);

        // Enviar información JSON cuando corresponda.
        if ($datos !== null) {

            $json = json_encode(
                $datos,
                JSON_UNESCAPED_UNICODE
            );

            if ($json === false) {
                unset($ch);

                throw new RuntimeException(
                    "No fue posible convertir los datos a JSON: "
                    . json_last_error_msg()
                );
            }

            $encabezados[] = "Content-Type: application/json";

            curl_setopt(
                $ch,
                CURLOPT_HTTPHEADER,
                $encabezados
            );

            curl_setopt(
                $ch,
                CURLOPT_POSTFIELDS,
                $json
            );
        }

        // Ejecutar solicitud.
        $respuesta = curl_exec($ch);

        $errorCurl = curl_error($ch);

        $codigoHTTP = curl_getinfo(
            $ch,
            CURLINFO_HTTP_CODE
        );

        // Liberar automáticamente el identificador cURL.
        unset($ch);

        // Error de conexión.
        if ($respuesta === false) {
            throw new RuntimeException(
                "Error al conectar con Node.js: " . $errorCurl
            );
        }

        // Convertir respuesta JSON.
        $resultado = json_decode($respuesta);

        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new RuntimeException(
                "Node.js devolvió una respuesta no válida: "
                . substr($respuesta, 0, 500)
            );
        }

        // Detectar errores HTTP.
        if ($codigoHTTP < 200 || $codigoHTTP >= 300) {

            $mensaje = $resultado->mensaje
                ?? "Error HTTP " . $codigoHTTP;

            throw new RuntimeException(
                $mensaje . " (HTTP " . $codigoHTTP . ")"
            );
        }

        // Detectar errores de la API.
        if (
            isset($resultado->ok) &&
            $resultado->ok === false
        ) {
            throw new RuntimeException(
                $resultado->mensaje ?? "Error en la API."
            );
        }

        return $resultado;
    }

    /**
     * Consultar registros.
     */
    public static function obtener($ruta) {

        return self::solicitar(
            "GET",
            $ruta
        );
    }

    /**
     * Guardar un registro.
     */
    public static function guardar($ruta, $datos) {

        return self::solicitar(
            "POST",
            $ruta,
            $datos
        );
    }

    /**
     * Actualizar un registro.
     */
    public static function actualizar(
        $ruta,
        $folio,
        $datos
    ) {

        return self::solicitar(
            "PUT",
            $ruta . "/" . rawurlencode($folio),
            $datos
        );
    }

    /**
     * Eliminar un registro.
     */
    public static function eliminar($ruta, $folio) {

        return self::solicitar(
            "DELETE",
            $ruta . "/" . rawurlencode($folio)
        );
    }
}
