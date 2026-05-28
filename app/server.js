require('dotenv').config({ path: '../.env' });

const express = require("express");
const https = require("https");
const http = require("http");
const fs = require("fs");
const path = require("path");
const helmet = require("helmet");

const app = express();

app.use(helmet());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

const authRoute    = require("./routes/Auth");
const profileRoute = require("./routes/Profile");
const adminRoute   = require("./routes/Admin");

app.use("/api/auth",    authRoute);
app.use("/api/profile", profileRoute);
app.use("/api/admin",   adminRoute);

const homeRoute = require("./routes/Home");
const userRoute = require("./routes/User");

app.use("/", homeRoute);
app.use("/user", userRoute);

app.get("/login",    (_req, res) => res.sendFile(path.join(__dirname, "views", "login.html")));
app.get("/register", (_req, res) => res.sendFile(path.join(__dirname, "views", "register.html")));
app.get("/profile",  (_req, res) => res.sendFile(path.join(__dirname, "views", "profile.html")));
app.get("/admin",    (_req, res) => res.sendFile(path.join(__dirname, "views", "admin.html")));

app.get("/test",      (_req, res) => res.send("db admin: root, pwd : root"));

const HTTPS_PORT = 8443;
const HTTP_PORT  = 8080;

const privateKey  = fs.readFileSync(path.join(__dirname, "certs", "key.pem"), "utf8");
const certificate = fs.readFileSync(path.join(__dirname, "certs", "cert.pem"), "utf8");

const httpsOptions = { key: privateKey, cert: certificate };

https.createServer(httpsOptions, app).listen(HTTPS_PORT, () => {
    console.log(`Serveur HTTPS démarré sur https://localhost:${HTTPS_PORT}`);
});

http.createServer((req, res) => {
    res.writeHead(301, { Location: `https://${req.headers.host.replace(/:\d+/, '')}:${HTTPS_PORT}${req.url}` });
    res.end();
}).listen(HTTP_PORT, () => {
    console.log(`Redirect HTTP → HTTPS sur http://localhost:${HTTP_PORT}`);
});
