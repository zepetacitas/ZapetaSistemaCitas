require("dotenv").config();
const { iniciarRecordatorios } =
    require("./services/recordatorios");

const { verificarCorreo } =
    require("./config/correo");

const express = require("express");

const conectarDB =
    require("./config/db");

const app = express();


// ========================================
// CONEXIÓN MONGODB
// ========================================

conectarDB();


// ========================================
// MIDDLEWARES
// ========================================

app.use(
    express.urlencoded({
        extended: true
    })
);

app.use(
    express.json()
);


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
app.use((req, res, next) => {
    console.log("Petición recibida:", req.method, req.originalUrl);
    next();
});
app.use(
    "/citas",
    citasRoutes
);
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
iniciarRecordatorios();

verificarCorreo()
    .then(() => {
        console.log("Gmail verificado correctamente");
    })
    .catch((error) => {
        console.error(
            "No se pudo verificar Gmail:",
            error.message
        );
    });
const PORT =
    process.env.PORT || 3000;


app.listen(
    PORT,
    () => {

        console.log("");

        console.log(
            " SISTEMA ZEPETA - CITAS"
        );

        console.log(
            `Servidor: http://localhost:${PORT}`
        );

        console.log(
            `Citas:    http://localhost:${PORT}/citas`
        );

    }
);