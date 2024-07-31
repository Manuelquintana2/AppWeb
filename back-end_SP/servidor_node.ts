
const express = require('express');

const app = express();

app.set('puerto', 12724);

app.get('/', (request: any, response: any) => {
    response.send('GET - servidor NodeJS');
});

//AGREGO FILE SYSTEM
const fs = require('fs');

//AGREGO JSON
app.use(express.json());

//AGREGO JWT
const jwt = require("jsonwebtoken");

//SE ESTABLECE LA CLAVE SECRETA PARA EL TOKEN
app.set("key", "cl@ve_secretaSP");

app.use(express.urlencoded({ extended: false }));

//AGREGO MULTER
const multer = require('multer');

//AGREGO MIME-TYPES
const mime = require('mime-types');

//AGREGO STORAGE
const storage = multer.diskStorage({

    destination: "public/juguetes/fotos/",
});

const upload = multer({

    storage: storage
});

//AGREGO CORS (por default aplica a http://localhost)
const cors = require("cors");

//AGREGO MW 
app.use(cors());

//DIRECTORIO DE ARCHIVOS ESTÁTICOS
app.use(express.static("public"));


//AGREGO MYSQL y EXPRESS-MYCONNECTION
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

//##############################################################################################//
//MIDDLEWARES JWT
//##############################################################################################//

const verificar_jwt = express.Router();

verificar_jwt.use((request: any, response: any, next: any) => {

    //SE RECUPERA EL TOKEN DEL ENCABEZADO DE LA PETICIÓN
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
        //SE VERIFICA EL TOKEN CON LA CLAVE SECRETA
        jwt.verify(token, app.get("key"), (error: any, decoded: any) => {

            if (error) {
                return response.json({
                    exito: false,
                    mensaje: "El JWT NO es válido!!!",
                    status: 403
                });
            }
            else {

                console.log("middleware verificar_jwt");

                //SE AGREGA EL TOKEN AL OBJETO DE LA RESPUESTA
                response.jwt = decoded;
                //SE INVOCA AL PRÓXIMO CALLEABLE
                next();
            }
        });
    }
});

//##############################################################################################//
//VALIDACION JWT
//##############################################################################################//

//#01
// app.post("/crear_token", (request: any, response: any) => {

//     if ((request.body.usuario == "admin" || request.body.usuario == "user") && request.body.clave == "123456") {

//         //SE CREA EL PAYLOAD CON LOS ATRIBUTOS QUE NECESITAMOS
//         const payload = {
//             exito: true,
//             usuario: request.body.usuario,
//             perfil: request.body.usuario == "admin" ? "administrador" : "usuario",

//         };

//         //SE FIRMA EL TOKEN CON EL PAYLOAD Y LA CLAVE SECRETA
//         const token = jwt.sign(payload, app.get("key"), {
//             expiresIn: "1d"
//         });

//         response.json({
//             mensaje: "JWT creado",
//             jwt: token
//         });
//     }
//     else {
//         response.json({
//             mensaje: "Usuario no registrado",
//             jwt: null
//         });
//     }

// });
//#02
// app.get('/verificar_token', verificar_jwt, (request: any, response: any) => {

//     response.json({ exito: true, jwt: response.jwt });
// });

//##############################################################################################//
//MIDDLEWARE USUARIO
//##############################################################################################//

const verificar_usuario = express.Router();

verificar_usuario.use((request: any, response: any, next: any) => {

    let obj = request.body;

    request.getConnection((err: any, conn: any) => {

        if (err) throw ("Error al conectarse a la base de datos.");

        conn.query("select * from usuarios where correo = ? and clave = ? ", [obj.correo, obj.clave], (err: any, rows: any) => {

            if (err) throw ("Error en consulta de base de datos.");

            if (rows.length == 1) {

                response.obj_usuario = rows[0];
                //SE INVOCA AL PRÓXIMO CALLEABLE
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

//##############################################################################################//
//LOGIN
//##############################################################################################//

//ACA CAMBIAR EL TIEMPO DEL TOKEN
app.post("/login", verificar_usuario, (request: any, response: any, obj: any) => {

    //SE RECUPERA EL USUARIO DEL OBJETO DE LA RESPUESTA
    const user = response.obj_usuario;

    //SE CREA EL PAYLOAD CON LOS ATRIBUTOS QUE NECESITAMOS
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

    //SE FIRMA EL TOKEN CON EL PAYLOAD Y LA CLAVE SECRETA
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

app.get("/login", (request: any, response: any, obj: any) => {

    //SE RECUPERA EL TOKEN DEL ENCABEZADO DE LA PETICIÓN
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
        //SE VERIFICA EL TOKEN CON LA CLAVE SECRETA
        jwt.verify(token, app.get("key"), (error: any, decoded: any) => {

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

//##############################################################################################//
//CRUD JUGUETES
//##############################################################################################//

//LISTAR
app.get('/toys', verificar_jwt, (request: any, response: any) => {

    request.getConnection((err: any, conn: any) => {

        if (err) throw ("Error al conectarse a la base de datos.");

        conn.query("select * from juguetes", (err: any, rows: any) => {

            if (err) throw ("Error en consulta de base de datos.");

            response.json({
                exito: true,
                mensaje: "Listado de Juguetes",
                status: 200,
                tabla: rows
            });
        });
    });

});

//AGREGAR
app.post('/toys', verificar_jwt, upload.single("foto"), (request: any, response: any) => {

    //alta_baja,
    let file = request.file;
    let extension = mime.extension(file.mimetype);
    let obj = JSON.parse(request.body.juguete_json);
    let path: string = file.destination + obj.marca + "." + extension;
    fs.renameSync(file.path, path);

    let path_foto = path.split("public/juguetes/fotos/")[1];

    let juguete = { "marca": obj.marca, "precio": obj.precio, "path_foto": path_foto };
    request.getConnection((err: any, conn: any) => {

        if (err) throw ("Error al conectarse a la base de datos.");

        conn.query("insert into juguetes set ?", [juguete], (err: any, rows: any) => {

            if (err) { console.log(err); throw ("Error en consulta de base de datos."); }

            response.json({
                exito: true,
                mensaje: "Juguete agregado a la bd.",
                status: 200
            });
        });
    });
});

//MODIFICAR
app.put('/toys', verificar_jwt, upload.single("foto"), (request: any, response: any) => {

    let file = request.file;
    let extension = mime.extension(file.mimetype);
    let obj = JSON.parse(request.body.juguete);
    let path: string = file.destination + obj.marca + "_modificacion" + "." + extension;

    fs.renameSync(file.path, path);

    let path_foto = path.split("public/juguetes/fotos/")[1];

    let jugueteModif = { "marca": obj.marca, "precio": obj.precio, "path_foto": path_foto };

    request.getConnection((err: any, conn: any) => {

        if (err) throw ("Error al conectarse a la base de datos.");

        conn.query("update juguetes set ? where id = ?", [jugueteModif, obj.id_juguete], (err: any, rows: any) => {

            if (err) { console.log(err); throw ("Error en consulta de base de datos."); }

            response.json({
                exito: true,
                mensaje: "Juguete modificado en la bd.",
                status: 200
            });
        });
    });
});

//ELIMINAR
app.delete('/toys', verificar_jwt, (request: any, response: any) => {

    let obj = request.body.id_juguete;
    let path: string = "public/juguetes/fotos/";

    request.getConnection((err: any, conn: any) => {

        if (err) throw ("Error al conectarse a la base de datos.");

        conn.query("select path_foto from juguetes where id = ?", [obj], (err: any, result: any) => {

            if (err) throw ("Error en consulta de base de datos.");

            path += result[0].path_foto;
        });
    });

    request.getConnection((err: any, conn: any) => {

        if (err) throw ("Error al conectarse a la base de datos.");

        conn.query("delete from juguetes where id = ?", [obj], (err: any, rows: any) => {

            if (err) { console.log(err); throw ("Error en consulta de base de datos."); }

            fs.unlink(path, (err: any) => {
                if (err) throw err;
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