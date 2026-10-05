<link rel="stylesheet" href="<?php echo BASE_URL; ?>public/css/pacientes.css?v=8">

<div class="contenedor">

    <!-- BARRA SUPERIOR -->
    <div class="top-bar">

        <h2 class="titulo">Módulo Pacientes</h2>

        <div class="lado-derecho">
            <a href="index.php" class="btn-icon">🏠</a>

            <a href="index.php" class="btn-salir">Salir</a>

	        <img src="<?php echo BASE_URL; ?>public/img/logo.png" class="logo">

        </div>

    </div>

    <!-- FORMULARIO -->
    <div class="formulario">
        <h3>Registro (Nuevo Paciente)</h3>

        <form method="POST">

            <input type="hidden" name="folio" value="<?= $editar['folio'] ?? '' ?>">

            <div class="grid-form">

                <input type="text" name="nombre" placeholder="Nombre" value="<?= $editar['nombre'] ?? '' ?>">
                <input type="text" name="apellido" placeholder="Apellido" value="<?= $editar['apellido'] ?? '' ?>">
                <input type="text" name="curp" placeholder="CURP" value="<?= $editar['curp'] ?? '' ?>">
                <input type="text" name="sexo" placeholder="Sexo" value="<?= $editar['sexo'] ?? '' ?>">
                <input type="date" name="fecha_nacimiento" value="<?= $editar['fecha_nacimiento'] ?? '' ?>">
                <input type="text" name="domicilio" placeholder="Domicilio" value="<?= $editar['domicilio'] ?? '' ?>">
                <input type="text" name="telefono" placeholder="Teléfono" value="<?= $editar['telefono'] ?? '' ?>">
                <input type="text" name="servicio" placeholder="Servicio" value="<?= $editar['servicio'] ?? '' ?>">

            </div>

            <div class="acciones-form">
                <button class="btn-guardar" type="submit" name="guardar">
                    <?= !empty($editar) ? 'Actualizar' : 'Guardar' ?>
                </button>
            </div>

        </form>
    </div>

    <!-- BUSCADOR -->
    <div class="buscador">
        <form method="POST" class="acciones">
            <input type="text" name="buscar" placeholder="Buscar por folio o CURP" required>
            <button type="submit" class="btn-buscar">Buscar</button>

            <a href="index.php?modulo=pacientes" class="btn-pdf">Mostrar todos</a>

            
            <a href="index.php?pdf=1&modulo=pacientes" target="_blank" class="btn-pdf">
                PDF
            </a>
        </form>
    </div>

    <h3>Tabla de registros</h3>

    <!-- TABLA -->
    <div class="tabla-responsive">
        <table id="tablaRegistros">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Folio</th>
                    <th>Nombre</th>
                    <th>Apellido</th>
                    <th>CURP</th>
                    <th>Sexo</th>
                    <th>Fecha</th>
                    <th>Domicilio</th>
                    <th>Teléfono</th>
                    <th>Servicio</th>
                    <th>Acciones</th>
                </tr>
            </thead>

            <tbody>
                <?php if(!empty($datos)){ ?>
                    <?php $i=1; foreach($datos as $item): ?>

                    <?php if(!is_array($item)) continue; ?> 

                    <tr>
                        <td><?= $i++ ?></td>
                        <td><?= $item['folio'] ?? '' ?></td>
                        <td><?= $item['nombre'] ?? '' ?></td>
                        <td><?= $item['apellido'] ?? '' ?></td>
                        <td><?= $item['curp'] ?? '' ?></td>
                        <td><?= $item['sexo'] ?? '' ?></td>
                        <td><?= $item['fecha_nacimiento'] ?? '' ?></td>
                        <td><?= $item['domicilio'] ?? '' ?></td>
                        <td><?= $item['telefono'] ?? '' ?></td>
                        <td><?= $item['servicio'] ?? '' ?></td>
                        <td>
                            <div class="acciones">
                                <a href="index.php?modulo=pacientes&editar=<?= $item['folio'] ?? '' ?>" class="btn-actualizar">Actualizar</a>
                                <a href="index.php?modulo=pacientes&eliminar=<?= $item['folio'] ?? '' ?>" class="btn-eliminar">Eliminar</a>
                            </div>
                        </td>
                    </tr>

                    <?php endforeach; ?>
                <?php }else{ ?>
                    <tr>
                        <td colspan="11">No hay registros</td>
                    </tr>
                <?php } ?>
            </tbody>
        </table>
    </div>

</div>