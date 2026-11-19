
require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const { rateLimit } = require("express-rate-limit");

const conectarDB = require("./config/db");

const { iniciarRecordatorios } =
    require("./services/recordatorios");

const app = express();

const PHP_URL =
    process.env.PHP_URL ||
    "https://zapetasistemacitas.onrender.com";

const PHP_LOGOUT_URL =
    process.env.PHP_LOGOUT_URL ||
    "https://zapetasistemacitas.onrender.com/";

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


 // ========================================
// REGISTRO DETALLADO DE PETICIONES
// ========================================

app.use((req, res, next) => {

    console.log("");
    console.log("========================================");
    console.log("PETICIÓN RECIBIDA");
    console.log("========================================");
    console.log("MÉTODO:", req.method);
    console.log("URL:", req.originalUrl);
    console.log("HOST:", req.get("host"));
    console.log("REFERER:", req.get("referer") || "SIN REFERER");
    console.log("USER-AGENT:", req.get("user-agent") || "SIN USER-AGENT");

    if (req.method === "POST") {
        console.log("BODY RECIBIDO:", req.body);
    }

    console.log("========================================");

    next();
});

// ========================================
// EJS
// ========================================

app.set("view engine", "ejs");
app.set("views", "./views");

// ========================================
// ARCHIVOS PÚBLICOS
// ========================================

app.use(express.static("public"));

// ========================================
// RUTAS API - CLIENTES
// ========================================

const clientesRoutes = require("./routes/clientes");
app.use("/api/clientes", clientesRoutes);

// ========================================
// RUTAS API - PACIENTES
// ========================================

const pacientesRoutes = require("./routes/pacientes");
app.use("/api/pacientes", pacientesRoutes);

// ========================================
// RUTAS API - EMPLEADOS
// ========================================

const empleadosRoutes = require("./routes/empleados");
app.use("/api/empleados", empleadosRoutes);

// ========================================
// RUTAS API - SOCIOS
// ========================================

const sociosRoutes = require("./routes/socios");
app.use("/api/socios", sociosRoutes);

// ========================================
// RUTAS CITAS
// ========================================

const citasRoutes = require("./routes/citas");
app.use("/citas", citasRoutes);

// ========================================
// CERRAR SESIÓN
// ========================================

app.get("/logout", (req, res) => {
    res.redirect(PHP_LOGOUT_URL);
});

// ========================================
// HOME
// ========================================

app.get("/", (req, res) => {
    res.redirect(PHP_URL);
});

// ========================================
// SERVIDOR
// ========================================

const PORT = process.env.PORT || 3000;

async function iniciarServidor() {
    try {
        // Conectar a MongoDB
        await conectarDB();

        console.log("MongoDB conectado correctamente.");

        // Iniciar recordatorios de citas
        iniciarRecordatorios();

        // Iniciar Express
        app.listen(PORT, "0.0.0.0", () => {
            console.log("");
            console.log("SISTEMA ZEPETA");
            console.log(`Servidor iniciado en el puerto ${PORT}`);
            console.log("Módulo de citas disponible en /citas");
            console.log("API de Clientes disponible en /api/clientes");
            console.log("API de Pacientes disponible en /api/pacientes");
            console.log("API de Empleados disponible en /api/empleados");
            console.log("API de Socios disponible en /api/socios");
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
