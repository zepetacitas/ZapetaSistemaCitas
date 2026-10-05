require("dotenv").config();

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

app.use(
    "/citas",
    citasRoutes
);


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