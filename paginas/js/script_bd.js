"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
window.addEventListener("load", () => {
    VerificarJWT();
    AdministrarVerificarJWT();
    AdministrarLogout();
    AdministrarListar();
    AdministrarAgregar();
});
function VerificarJWT() {
    return __awaiter(this, void 0, void 0, function* () {
        let jwt = localStorage.getItem("jwt");
        try {
            const opciones = {
                method: "GET",
                headers: { 'Authorization': 'Bearer ' + jwt },
            };
            let res = yield manejadorFetch(URL_API + "login", opciones);
            let obj_rta = yield res.json();
            console.log(obj_rta);
            if (obj_rta.exito) {
                let usuario = obj_rta.jwt.usuario;
                document.getElementById("nombre_usuario").innerHTML = usuario.nombre;
            }
            else {
                alert("El jwt no es valido");
                setTimeout(() => {
                    location.assign(URL_BASE + "index.html");
                }, 1500);
            }
        }
        catch (err) {
            Fail(err);
        }
    });
}
function AdministrarVerificarJWT() {
}
function AdministrarLogout() {
}
function AdministrarListar() {
    document.getElementById("listado_juguetes").onclick = () => {
        ObtenerListadoProductos();
    };
}
function AdministrarAgregar() {
    document.getElementById("alta_juguete").onclick = () => {
        ArmarFormularioAlta();
    };
}
function ObtenerListadoProductos() {
    return __awaiter(this, void 0, void 0, function* () {
        VerificarJWT();
        let jwt = localStorage.getItem("jwt");
        try {
            const opciones = {
                method: "GET",
                headers: { 'Authorization': 'Bearer ' + jwt },
            };
            let res = yield manejadorFetch(URL_API + "toys", opciones);
            var obj_rta = yield res.json();
            console.log(obj_rta);
            let tabla = ArmarTablaProductos(obj_rta.tabla);
            document.getElementById("divTablaIzq").innerHTML = tabla;
            document.querySelectorAll('[data-action="modificar"]').forEach((btn) => {
                btn.onclick = function () {
                    let obj_prod_string = this.getAttribute("data-obj_prod");
                    let obj_prod = JSON.parse(obj_prod_string);
                    let formulario = MostrarForm("modificacion", obj_prod);
                    document.getElementById("divTablaDer").innerHTML = formulario;
                };
            });
            document.querySelectorAll('[data-action="eliminar"]').forEach((btn) => {
                btn.onclick = function () {
                    let obj_prod_string = this.getAttribute("data-obj_prod");
                    let obj_prod = JSON.parse(obj_prod_string);
                    let formulario = MostrarForm("baja", obj_prod);
                    document.getElementById("divTablaDer").innerHTML = formulario;
                };
            });
        }
        catch (_a) {
            alert(obj_rta.mensaje);
            setTimeout(() => {
                location.assign(URL_BASE + "index.html");
            }, 1500);
        }
    });
}
function ArmarTablaProductos(productos) {
    let tabla = '<table class="table table-red table-hover">';
    tabla += '<tr><th>CÓDIGO</th><th>MARCA</th><th>PRECIO</th><th>FOTO</th><th style="width:110px">ACCIONES</th></tr>';
    if (productos.length == 0) {
        tabla += '<tr><td>---</td><td>---</td><td>---</td><td>---</td><th>---</td></tr>';
    }
    else {
        productos.forEach((prod) => {
            tabla += "<tr><td>" + prod.id + "</td><td>" + prod.marca + "</td><td>" + prod.precio + "</td>" +
                "<td><img src='" + URL_API + "juguetes/fotos/" + prod.path_foto + "' width='50px' height='50px'></td><th>" +
                "<a href='#' class='btn' data-action='modificar' data-obj_prod='" + JSON.stringify(prod) + "' title='Modificar'" +
                " data-toggle='modal' data-target='#ventana_modal_prod'><span class='fas fa-edit'></span></a>" +
                "<a href='#' class='btn' data-action='eliminar' data-obj_prod='" + JSON.stringify(prod) + "' title='Eliminar'" +
                " data-toggle='modal' data-target='#ventana_modal_prod'><span class='fas fa-times'></span></a>" +
                "</td></tr>";
        });
    }
    tabla += "</table>";
    return tabla;
}
function ArmarFormularioAlta() {
    var _a;
    document.getElementById("divTablaDer").innerHTML = "";
    let formulario = MostrarForm("alta");
    document.getElementById("divTablaDer").innerHTML = formulario;
    (_a = document.getElementById("btn_modal")) === null || _a === void 0 ? void 0 : _a.click();
}
function MostrarForm(accion, obj_prod = null) {
    let funcion = "";
    let encabezado = "";
    let solo_lectura = "";
    let solo_lectura_pk = "readonly";
    let modal = "";
    switch (accion) {
        case "alta":
            funcion = 'Agregar(event)';
            encabezado = 'JUGUETES';
            solo_lectura_pk = "";
            modal = "Agregar";
            break;
        case "baja":
            funcion = 'Eliminar(event)';
            encabezado = 'ELIMINAR Juguete';
            solo_lectura = "readonly";
            modal = "Eliminar";
            break;
        case "modificacion":
            funcion = 'Modificar(event)';
            encabezado = 'MODIFICAR Juguete';
            modal = "Modificar";
            break;
    }
    let id = "";
    let codigo = "";
    let marca = "";
    let precio = "";
    let path = URL_BASE + "/img/producto_default.png";
    if (obj_prod !== null) {
        id = obj_prod.id;
        codigo = obj_prod.codigo;
        marca = obj_prod.marca;
        precio = obj_prod.precio;
        path = URL_API + obj_prod.path;
    }
    let form = `<div class="container-fluid">
        <br>
        <div class="row">
            <div class="offset-4 col-8 text-info">
                <h2>${encabezado}</h2>
            </div>
        </div>

        <div class="row">
            <div class="offset-4 col-6">
                <div class="form-bottom" style="background-color: darkcyan;">
                    <form role="form" action="" method="" class="">
                        <br>
                        <input type="hidden" id="id_juguete" value="${id}">
                        <div class="form-group">                                  
                            <div class="input-group m-2">
                                <div class="input-group-prepend">
                                    <span class="input-group-text fas fa-trademark"></span> 
                                    <input type="text" class="form-control" name="marca" id="txtMarca" style="width:248px;" placeholder="Marca" value="${marca}" ${solo_lectura}/>
                                </div>
                            </div>
                        </div>

                        <div class="form-group">    
                            <div class="input-group m-2">
                                <div class="input-group-prepend">
                                    <span class="input-group-text fas fa-dollar-sign"></span> 
                                    <input type="text" class="form-control" name="precio" id="txtPrecio" style="width:250px;" placeholder="Precio" value="${precio}" ${solo_lectura}/>
                                </div>
                            </div>
                        </div>

                        <div class="form-group">
                            <div class="input-group m-2">
                                <div class="input-group-prepend">
                                    <span class="input-group-text fas fa-camera"></span> 
                                    <input type="file" class="form-control" name="foto" id="txtFoto" style="width:250px;" placeholder="Foto" ${solo_lectura}/>
                                </div>
                            </div>
                        </div>
                        
                        <div class="row m-2">
                            <div class="col-60">
                                <button type="button" class="btn btn-success btn-block" id="btnEnviar" onclick="${funcion}">${modal}</button>
                            </div>
                            <div class="col-60">
                                <button type="reset" class="btn btn-warning btn-block" id="btnEnviar">Limpiar</button>
                            </div>
                        </div>
                        <br>
                    </form>
                </div>
            </div>
        </div>
    </div>`;
    return form;
}
function Agregar(e) {
    return __awaiter(this, void 0, void 0, function* () {
        let jwt = localStorage.getItem("jwt");
        yield VerificarJWT();
        let marca = document.getElementById("txtMarca").value;
        let precio = document.getElementById("txtPrecio").value;
        let precioINT = parseInt(precio);
        let foto = document.getElementById("txtFoto");
        let pathFoto = foto.files[0];
        let obj_prod = {
            "marca": marca,
            "precio": precioINT
        };
        let form = new FormData();
        form.append('foto', pathFoto);
        form.append('juguete_json', JSON.stringify(obj_prod));
        const opciones = {
            method: "POST",
            headers: { 'Authorization': 'Bearer ' + jwt },
            body: form
        };
        try {
            let res = yield manejadorFetch(URL_API + "toys", opciones);
            let resText = yield res.json();
            console.log(resText);
            if (resText.exito) {
                alert("se pudo agregar");
                ObtenerListadoProductos();
            }
            else {
                alert("error");
            }
        }
        catch (error) {
            console.log(error);
            alert(error);
        }
    });
}
function Modificar(e) {
    return __awaiter(this, void 0, void 0, function* () {
        let jwt = localStorage.getItem("jwt");
        yield VerificarJWT();
        let id = document.getElementById("id_juguete").value;
        let idInt = parseInt(id);
        let marca = document.getElementById("txtMarca").value;
        let precio = document.getElementById("txtPrecio").value;
        let precioINT = parseInt(precio);
        let foto = document.getElementById("txtFoto");
        let pathFoto = foto.files[0];
        let obj_prod = {
            "id_juguete": idInt,
            "marca": marca,
            "precio": precioINT
        };
        let form = new FormData();
        form.append('foto', pathFoto);
        form.append('juguete', JSON.stringify(obj_prod));
        const opciones = {
            method: "PUT",
            headers: { 'Authorization': 'Bearer ' + jwt },
            body: form
        };
        try {
            const res = yield manejadorFetch(URL_API + "toys", opciones);
            const resText = yield res.json();
            alert("Se modifico correctamente");
            ObtenerListadoProductos();
        }
        catch (_a) {
            alert("Error");
        }
    });
}
function Eliminar(e) {
    e.preventDefault();
    let id = document.getElementById("id_juguete").value;
    let juguete = document.getElementById("txtMarca").value;
    if (confirm(`¿Seguro quieres eliminar el juguete ${id} y su marca ${juguete}`)) {
        ContinuarEliminar(id);
    }
}
function ContinuarEliminar(id) {
    return __awaiter(this, void 0, void 0, function* () {
        let jwt = localStorage.getItem("jwt");
        yield VerificarJWT();
        let idINT = parseInt(id);
        let obj_prod = {
            "id_juguete": idINT
        };
        const opciones = {
            method: "DELETE",
            body: JSON.stringify(obj_prod),
            headers: { 'Authorization': 'Bearer ' + jwt, 'Content-Type': 'application/json' }
        };
        try {
            const res = yield manejadorFetch(URL_API + "toys", opciones);
            const resText = yield res.json();
            if (resText.exito) {
                alert(resText.mensaje);
                console.log(resText.mensaje);
                ObtenerListadoProductos();
            }
            else {
                alert(resText.mensaje);
                console.log(resText.mensaje);
            }
        }
        catch (_a) {
            alert("Error");
        }
    });
}
//# sourceMappingURL=script_bd.js.map