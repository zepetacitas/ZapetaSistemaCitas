require("dotenv").config();

const { iniciarRecordatorios } =
    require("./services/recordatorios");

const { verificarCorreo } =
    require("./config/correo");

const express = require("express");

const conectarDB =
    require("./config/db");

const helmet = require("helmet");
const { rateLimit } = require("express-rate-limit");

const app = express();

// ========================================
// SEGURIDAD
// ========================================

app.disable("x-powered-by");

app.use(helmet());

// ========================================
// MIDDLEWARES
// ========================================

app.use(express.urlencoded({
    extended: true,
    limit: "10kb",
    parameterLimit: 50
}));

app.use(express.json({
    limit: "10kb"
}));

// ========================================
// REGISTRO DE PETICIONES
// ========================================

app.use((req, res, next) => {
    console.log(
        "Petición recibida:",
        req.method,
        req.originalUrl
    );

    next();
});

// ========================================
// EJS
// ========================================

app.set(
    "view engine",
    "ejs"
);

app.set(
    "views",
    "./views"
);

// ========================================
// ARCHIVOS PÚBLICOS
// ========================================

app.use(
    express.static("public")
);

// ========================================
// RUTAS CITAS
// ========================================

const citasRoutes =
    require("./routes/citas");

app.use(
    "/citas",
    citasRoutes
);

// ========================================
// CERRAR SESIÓN
// Node.js → Home PHP
// ========================================

app.get("/logout", (req, res) => {
    res.redirect("http://localhost:8000/");
});

// ========================================
// HOME
// Node.js → Home PHP
// ========================================

app.get("/", (req, res) => {
    res.redirect(
        "http://localhost/sistema_zepeta_completo/"
    );
});

// ========================================
// SERVIDOR
// ========================================

const PORT = process.env.PORT || 3000;

async function iniciarServidor() {
    try {
        // Conectar primero a MongoDB
        await conectarDB();

        console.log("MongoDB conectado correctamente.");

        // Iniciar recordatorios de citas
        iniciarRecordatorios();

        // Verificar configuración de Gmail
        verificarCorreo()
            .then(() => {
                console.log(
                    "Gmail verificado correctamente"
                );
            })
            .catch((error) => {
                console.error(
                    "No se pudo verificar Gmail:",
                    error.message
                );
            });

        // Iniciar servidor Express
        app.listen(PORT, () => {
            console.log("");
            console.log("SISTEMA ZEPETA - CITAS");
            console.log(
                `Servidor: http://localhost:${PORT}`
            );
            console.log(
                `Citas: http://localhost:${PORT}/citas`
            );
        });

    } catch (error) {
        console.error(
            "No se pudo iniciar el servidor:",
            error.message
        );

        process.exit(1);
    }
}

iniciarServidor();
