<?php
$archivos = [
    __DIR__ . "/config/api.php",
    __DIR__ . "/models/ApiMongoClient.php",
];

foreach ($archivos as $archivo) {
    echo "\nArchivo: " . basename($archivo) . "\n";

    $contenido = file_get_contents($archivo);

    echo "Primeros bytes: ";
    echo bin2hex(substr($contenido, 0, 12));
    echo "\n";

    if (substr($contenido, 0, 3) === "\xEF\xBB\xBF") {
        echo "RESULTADO: Tiene BOM UTF-8\n";
    } else {
        echo "RESULTADO: No tiene BOM UTF-8\n";
    }

    if (strpos($contenido, "<?php") !== 0) {
        echo "ADVERTENCIA: Hay contenido antes de PHP\n";
    }
}
