"use strict";
const express = require('express');
const app = express();
app.set('puerto', 12724);
app.get('/', (request, response) => {
    response.send('GET - servidor NodeJS');
});
const fs = require('fs');
app.use(express.json());
const jwt = require("jsonwebtoken");
app.set("key", "cl@ve_secretaSP");
app.use(express.urlencoded({ extended: false }));
const multer = require('multer');
const mime = require('mime-types');
const storage = multer.diskStorage({
    destination: "public/juguetes/fotos/",
});
const upload = multer({
    storage: storage
});
const cors = require("cors");
app.use(cors());
app.use(express.static("public"));
const mysql = require('mysql');
const myconn = require('express-myconnection');
const db_options = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'jugueteria_bd'
};
app.use(myconn(mysql, db_options, 'single'));
const verificar_jwt = express.Router();
verificar_jwt.use((request, response, next) => {
    let token = request.headers["x-access-token"] || request.headers["authorization"];
    if (!token) {
        response.status(401).send({
            error: "El JWT es requerido!!!"
        });
        return;
    }
    if (token.startsWith("Bearer ")) {
        token = token.slice(7, token.length);
    }
    if (token) {
        jwt.verify(token, app.get("key"), (error, decoded) => {
            if (error) {
                return response.json({
                    exito: false,
                    mensaje: "El JWT NO es válido!!!",
                    status: 403
                });
            }
            else {
                console.log("middleware verificar_jwt");
                response.jwt = decoded;
                next();
            }
        });
    }
});
const verificar_usuario = express.Router();
verificar_usuario.use((request, response, next) => {
    let obj = request.body;
    request.getConnection((err, conn) => {
        if (err)
            throw ("Error al conectarse a la base de datos.");
        conn.query("select * from usuarios where correo = ? and clave = ? ", [obj.correo, obj.clave], (err, rows) => {
            if (err)
                throw ("Error en consulta de base de datos.");
            if (rows.length == 1) {
                response.obj_usuario = rows[0];
                next();
            }
            else {
                response.status(401).json({
                    exito: false,
                    mensaje: "Correo y/o Clave incorrectos.",
                    jwt: null
                });
            }
        });
    });
});
app.post("/login", verificar_usuario, (request, response, obj) => {
    const user = response.obj_usuario;
    const payload = {
        usuario: {
            id: user.id,
            apellido: user.apellido,
            nombre: user.nombre,
            perfil: user.perfil,
            correo: user.correo,
            foto: user.foto,
            parcial: "Segundo parcial LABORATORIO III"
        },
        api: "juguetes_usuarios",
    };
    const token = jwt.sign(payload, app.get("key"), {
        expiresIn: "120s"
    });
    response.json({
        exito: true,
        mensaje: "JWT creado!!!",
        jwt: token,
        status: 200
    });
});
app.get("/login", (request, response, obj) => {
    let token = request.headers["x-access-token"] || request.headers["authorization"];
    if (!token) {
        response.status(401).send({
            error: "El JWT es requerido!!!"
        });
        return;
    }
    if (token.startsWith("Bearer ")) {
        token = token.slice(7, token.length);
    }
    if (token) {
        jwt.verify(token, app.get("key"), (error, decoded) => {
            if (error) {
                return response.json({
                    exito: false,
                    mensaje: "El JWT NO es válido!!!"
                });
            }
            else {
                response.json({
                    exito: true,
                    mensaje: "Datos JWT",
                    jwt: jwt.decode(token),
                    status: 200
                });
            }
        });
    }
});
app.get('/toys', verificar_jwt, (request, response) => {
    request.getConnection((err, conn) => {
        if (err)
            throw ("Error al conectarse a la base de datos.");
        conn.query("select * from juguetes", (err, rows) => {
            if (err)
                throw ("Error en consulta de base de datos.");
            response.json({
                exito: true,
                mensaje: "Listado de Juguetes",
                status: 200,
                tabla: rows
            });
        });
    });
});
app.post('/toys', verificar_jwt, upload.single("foto"), (request, response) => {
    let file = request.file;
    let extension = mime.extension(file.mimetype);
    let obj = JSON.parse(request.body.juguete_json);
    let path = file.destination + obj.marca + "." + extension;
    fs.renameSync(file.path, path);
    let path_foto = path.split("public/juguetes/fotos/")[1];
    let juguete = { "marca": obj.marca, "precio": obj.precio, "path_foto": path_foto };
    request.getConnection((err, conn) => {
        if (err)
            throw ("Error al conectarse a la base de datos.");
        conn.query("insert into juguetes set ?", [juguete], (err, rows) => {
            if (err) {
                console.log(err);
                throw ("Error en consulta de base de datos.");
            }
            response.json({
                exito: true,
                mensaje: "Juguete agregado a la bd.",
                status: 200
            });
        });
    });
});
app.put('/toys', verificar_jwt, upload.single("foto"), (request, response) => {
    let file = request.file;
    let extension = mime.extension(file.mimetype);
    let obj = JSON.parse(request.body.juguete);
    let path = file.destination + obj.marca + "_modificacion" + "." + extension;
    fs.renameSync(file.path, path);
    let path_foto = path.split("public/juguetes/fotos/")[1];
    let jugueteModif = { "marca": obj.marca, "precio": obj.precio, "path_foto": path_foto };
    request.getConnection((err, conn) => {
        if (err)
            throw ("Error al conectarse a la base de datos.");
        conn.query("update juguetes set ? where id = ?", [jugueteModif, obj.id_juguete], (err, rows) => {
            if (err) {
                console.log(err);
                throw ("Error en consulta de base de datos.");
            }
            response.json({
                exito: true,
                mensaje: "Juguete modificado en la bd.",
                status: 200
            });
        });
    });
});
app.delete('/toys', verificar_jwt, (request, response) => {
    let obj = request.body.id_juguete;
    let path = "public/juguetes/fotos/";
    request.getConnection((err, conn) => {
        if (err)
            throw ("Error al conectarse a la base de datos.");
        conn.query("select path_foto from juguetes where id = ?", [obj], (err, result) => {
            if (err)
                throw ("Error en consulta de base de datos.");
            path += result[0].path_foto;
        });
    });
    request.getConnection((err, conn) => {
        if (err)
            throw ("Error al conectarse a la base de datos.");
        conn.query("delete from juguetes where id = ?", [obj], (err, rows) => {
            if (err) {
                console.log(err);
                throw ("Error en consulta de base de datos.");
            }
            fs.unlink(path, (err) => {
                if (err)
                    throw err;
                console.log(path + ' fue borrado.');
            });
            response.json({
                exito: true,
                mensaje: "Juguete eliminado de la bd.",
                status: 200
            });
        });
    });
});
app.listen(app.get('puerto'), () => {
    console.log('Servidor corriendo sobre puerto:', app.get('puerto'));
});
//# sourceMappingURL=servidor_node.js.map