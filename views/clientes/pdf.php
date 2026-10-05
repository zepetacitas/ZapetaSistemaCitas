<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Reporte de Clientes</title>

<style>
body{
    font-family: Arial, sans-serif;
    padding: 20px;
}

.header{
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.logo{
    width: 100px;
}

.titulo{
    text-align: center;
    flex: 1;
}

.fecha{
    font-size: 12px;
}

h2{
    margin: 0;
}

table{
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
}

th{
    background: #333;
    color: #fff;
    padding: 8px;
    font-size: 12px;
}

td{
    padding: 6px;
    font-size: 11px;
    border: 1px solid #ccc;
}

tr:nth-child(even){
    background: #f2f2f2;
}

.footer{
    margin-top: 20px;
    text-align: right;
    font-size: 12px;
}

/*  Para imprimir registros */
@media print{
    button{
        display: none;
    }
}
</style>

</head>
<body>

<!-- BOTÓN IMPRIMIR -->
<button onclick="window.print()">🖨️ Guardar / Imprimir PDF</button>

<div class="header">
    <img src="public/img/logo.png" class="logo">

    <div class="titulo">
        <h2>Reporte de Clientes</h2>
        <p>Sistema Zepeta</p>
    </div>

    <div class="fecha">
        <strong>Fecha:</strong><br>
        <?= $fecha ?>
    </div>
</div>

<table>
    <tr>
        <th>#</th>
        <th>Folio</th>
        <th>Nombre</th>
        <th>Apellido</th>
        <th>CURP</th>
        <th>Sexo</th>
        <th>Fecha Nac.</th>
        <th>Domicilio</th>
        <th>Teléfono</th>
        <th>Servicio</th>
    </tr>

    <?php $i=1; foreach($datos as $c): ?>
    <tr>
        <td><?= $i++ ?></td>
        <td><?= $c['folio'] ?? '' ?></td>
        <td><?= $c['nombre'] ?? '' ?></td>
        <td><?= $c['apellido'] ?? '' ?></td>
        <td><?= $c['curp'] ?? '' ?></td>
        <td><?= $c['sexo'] ?? '' ?></td>
        <td><?= $c['fecha_nacimiento'] ?? '' ?></td>
        <td><?= $c['domicilio'] ?? '' ?></td>
        <td><?= $c['telefono'] ?? '' ?></td>
        <td><?= $c['servicio'] ?? '' ?></td>
    </tr>
    <?php endforeach; ?>
</table>

<div class="footer">
    Total de registros: <?= count($datos) ?>
</div>

</body>
</html>