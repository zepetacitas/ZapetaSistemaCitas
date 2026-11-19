
const fs = require("fs");
const path = require("path");

async function obtenerToken() {
    try {
        const rutaCredenciales = path.join(
            __dirname,
            "credentials.json"
        );

        if (!fs.existsSync(rutaCredenciales)) {
            throw new Error("No se encontró credentials.json");
        }

        const datos = JSON.parse(
            fs.readFileSync(rutaCredenciales, "utf8")
        );

        const configuracion = datos.installed || datos.web;

        if (!configuracion) {
            throw new Error("El JSON no contiene credenciales OAuth válidas.");
        }

        const { authenticate } = await import("@google-cloud/local-auth");

        console.log("Abriendo autorización de Google...");

        const auth = await authenticate({
            scopes: [
                "https://www.googleapis.com/auth/gmail.send"
            ],
            keyfilePath: rutaCredenciales
        });

        const refreshToken = auth.credentials.refresh_token;

        if (!refreshToken) {
            throw new Error(
                "Google no entregó un refresh token. " +
                "Revoca el acceso de la aplicación y vuelve a autorizar."
            );
        }

        console.log("\nAUTORIZACIÓN COMPLETADA");
        console.log("\nCopia estos valores en Render:");
        console.log("\nGMAIL_CLIENT_ID=");
        console.log(configuracion.client_id);
        console.log("\nGMAIL_CLIENT_SECRET=");
        console.log(configuracion.client_secret);
        console.log("\nGMAIL_REFRESH_TOKEN=");
        console.log(refreshToken);

    } catch (error) {
        console.error("ERROR:", error.message);
    }
}

obtenerToken();
