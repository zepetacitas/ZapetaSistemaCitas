<?php

// ========================================
// CONFIGURACIÓN DE COMUNICACIÓN PHP - NODE
// ========================================

// Ruta del archivo .env ubicado en la raíz.
$rutaEnv = dirname(__DIR__) . DIRECTORY_SEPARATOR . ".env";

// Cargar las variables del archivo .env
$variablesEnv = [];

if (file_exists($rutaEnv)) {

    $lineas = file(
        $rutaEnv,
        FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES
    );

    foreach ($lineas as $linea) {

        $linea = trim($linea);

        // Ignorar comentarios.
        if ($linea === "" || strpos($linea, "#") === 0) {
            continue;
        }

        // Separar nombre y valor.
        $partes = explode("=", $linea, 2);

        if (count($partes) !== 2) {
            continue;
        }

        $nombre = trim($partes[0]);
        $valor = trim($partes[1]);

        // Quitar comillas exteriores.
        if (
            strlen($valor) >= 2 &&
            (
                ($valor[0] === '"' && substr($valor, -1) === '"') ||
                ($valor[0] === "'" && substr($valor, -1) === "'")
            )
        ) {
            $valor = substr($valor, 1, -1);
        }

        $variablesEnv[$nombre] = $valor;
    }
}

// ========================================
// URL DE NODE.JS
// ========================================

$urlNode = getenv("NODE_API_URL")
    ?: ($variablesEnv["NODE_API_URL"] ?? "http://localhost:3000");

// ========================================
// CLAVE COMPARTIDA
// ========================================

$apiKey = getenv("API_SHARED_KEY")
    ?: ($variablesEnv["API_SHARED_KEY"] ?? "");

// ========================================
// VALIDAR CONFIGURACIÓN
// ========================================

if (empty($apiKey)) {
    throw new RuntimeException(
        "ERROR: No se encontró API_SHARED_KEY en el archivo .env"
    );
}

// ========================================
// DEFINIR CONSTANTES
// ========================================

if (!defined("NODE_API_URL")) {
    define("NODE_API_URL", rtrim($urlNode, "/"));
}

if (!defined("NODE_API_KEY")) {
    define("NODE_API_KEY", $apiKey);
}
