window.addEventListener("load", ():void => {

    VerificarJWT();

    AdministrarVerificarJWT();

    AdministrarLogout();

    AdministrarListar();

    AdministrarAgregar();

});

async function VerificarJWT() : Promise<void> {
    
    //RECUPERO DEL LOCALSTORAGE
    let jwt : string | null = localStorage.getItem("jwt");

    try {

        const opciones = {
            method: "GET",
            headers : {'Authorization': 'Bearer ' + jwt},
        };

        let res = await manejadorFetch(URL_API + "login", opciones);

        let obj_rta = await res.json();

        console.log(obj_rta);

        if(obj_rta.exito){

            let usuario = obj_rta.jwt.usuario;

            //let alerta : string = ArmarAlert("ApiRest: " + app + "<br>Versión: " + version + "<br>Usuario: " + JSON.stringify(usuario));
            
            //(<HTMLDivElement>document.getElementById("divResultado")).innerHTML = alerta;
           
            (<HTMLDivElement>document.getElementById("nombre_usuario")).innerHTML = usuario.nombre;
        }
        else{
            // let alerta : string = ArmarAlert(obj_rta.mensaje, "danger");
            alert("El jwt no es valido");
    
             //(<HTMLDivElement>document.getElementById("divResultado")).innerHTML = alerta;
    
            setTimeout(() => {
                location.assign(URL_BASE + "index.html");
            }, 1500);
        }
        
    } catch (err:any) {
        
        Fail(err);
    }     
}

function AdministrarVerificarJWT() : void {
    
//     (<HTMLInputElement>document.getElementById("verificarJWT")).onclick = ()=>{

//         VerificarJWT();
//     };
}

function AdministrarLogout() : void
{
    // (<HTMLInputElement>document.getElementById("logout")).onclick = ()=>{

    //     localStorage.removeItem("jwt"); //elimino del localstoragae

    //     let alerta : string = ArmarAlert('Usuario deslogueado!!!');

    //     (<HTMLDivElement>document.getElementById("divResultado")).innerHTML = alerta;

    //     setTimeout(() => {
    //         location.assign(URL_BASE + "login.html");
    //     }, 1500);

    // };
}

function AdministrarListar() : void {

    (<HTMLInputElement>document.getElementById("listado_juguetes")).onclick = ()=>{

        ObtenerListadoProductos();
    };
}

function AdministrarAgregar() : void {

    (<HTMLInputElement>document.getElementById("alta_juguete")).onclick = ()=>{

        ArmarFormularioAlta();
    };
}

//#region IMPLEMENTAR...

async function ObtenerListadoProductos() : Promise<void>
{
    VerificarJWT();
    let jwt : string | null = localStorage.getItem("jwt"); 
    
    try 
    {
        const opciones = {
            method: "GET",
            headers : {'Authorization': 'Bearer ' + jwt},
        };

        let res = await manejadorFetch(URL_API + "toys", opciones);

        var obj_rta = await res.json();

        console.log(obj_rta);

        let tabla : string = ArmarTablaProductos(obj_rta.tabla);
    
        (<HTMLDivElement>document.getElementById("divTablaIzq")).innerHTML = tabla;
    
        document.querySelectorAll('[data-action="modificar"]').forEach((btn:any)=>
            {
                btn.onclick = function ()
                {
                    let obj_prod_string : any = this.getAttribute("data-obj_prod");
                    let obj_prod = JSON.parse(obj_prod_string);
    
                    let formulario = MostrarForm("modificacion", obj_prod);
                    (<HTMLDivElement>document.getElementById("divTablaDer")).innerHTML = formulario;
                }
            });
    
        document.querySelectorAll('[data-action="eliminar"]').forEach((btn:any)=>
            {
                btn.onclick = function ()
                {
                    let obj_prod_string : any = this.getAttribute("data-obj_prod");
                    let obj_prod = JSON.parse(obj_prod_string);
    
                    let formulario = MostrarForm("baja", obj_prod);
                    (<HTMLDivElement>document.getElementById("divTablaDer")).innerHTML = formulario;
                }
            });
    }
    catch
    {
        alert(obj_rta.mensaje);
        setTimeout(() => {
            location.assign(URL_BASE + "index.html");
        }, 1500);
    }
        
}

//#endregion

function ArmarTablaProductos(productos : []) : string 
{   
    let tabla : string = '<table class="table table-red table-hover">';
    tabla += '<tr><th>CÓDIGO</th><th>MARCA</th><th>PRECIO</th><th>FOTO</th><th style="width:110px">ACCIONES</th></tr>';

    if(productos.length == 0)
    {
        tabla += '<tr><td>---</td><td>---</td><td>---</td><td>---</td><th>---</td></tr>';
    }
    else
    {
        productos.forEach((prod : any) => {

            tabla += "<tr><td>"+prod.id+"</td><td>"+prod.marca+"</td><td>"+prod.precio+"</td>"+
            "<td><img src='"+URL_API+"juguetes/fotos/"+prod.path_foto+"' width='50px' height='50px'></td><th>"+
            "<a href='#' class='btn' data-action='modificar' data-obj_prod='"+JSON.stringify(prod)+"' title='Modificar'"+
            " data-toggle='modal' data-target='#ventana_modal_prod'><span class='fas fa-edit'></span></a>"+
            "<a href='#' class='btn' data-action='eliminar' data-obj_prod='"+JSON.stringify(prod)+"' title='Eliminar'"+
            " data-toggle='modal' data-target='#ventana_modal_prod'><span class='fas fa-times'></span></a>"+
            "</td></tr>"
            ;
        });
    }

    tabla += "</table>";

    return tabla;
}

function ArmarFormularioAlta() : void
{
    (<HTMLDivElement>document.getElementById("divTablaDer")).innerHTML = "";

    let formulario : string = MostrarForm("alta");

    (<HTMLDivElement>document.getElementById("divTablaDer")).innerHTML = formulario;

    document.getElementById("btn_modal")?.click();
}

function MostrarForm(accion : string, obj_prod : any = null) : string 
{
    let funcion : string = "";
    let encabezado : string = "";
    let solo_lectura : string = "";
    let solo_lectura_pk : string = "readonly";
    let modal = "";

    switch (accion)
    {
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
    let id : string = "";
    let codigo : string = "";
    let marca : string = "";
    let precio : string = "";
    let path : string = URL_BASE + "/img/producto_default.png";

    if (obj_prod !== null) //esto es para el modificar
    {
        id = obj_prod.id;
        codigo = obj_prod.codigo;
        marca = obj_prod.marca;
        precio = obj_prod.precio;
        path = URL_API + obj_prod.path;       
    }

    let form: string = `<div class="container-fluid">
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

//#region CRUD

async function Agregar(e : any) : Promise<void> 
{  
    let jwt : string | null = localStorage.getItem("jwt"); 
    await VerificarJWT();

    let marca:string = (<HTMLInputElement> document.getElementById("txtMarca")).value;
    let precio:string = (<HTMLInputElement> document.getElementById("txtPrecio")).value;
    let precioINT = parseInt(precio);
    let foto:any = (<HTMLInputElement> document.getElementById("txtFoto"));
    let pathFoto = foto.files[0];

    let obj_prod = {
        "marca": marca,
        "precio": precioINT
    };

    let form : FormData = new FormData();
    form.append('foto', pathFoto);
    form.append('juguete_json', JSON.stringify(obj_prod));

    const opciones = 
    {
        method: "POST",
        headers : {'Authorization': 'Bearer ' + jwt}, //MÉTODO HTTP
        body: form
    }
    try
    {
        let res = await manejadorFetch(URL_API + "toys", opciones);

        let resText = await res.json();
        console.log(resText);

        if(resText.exito)
        {
            alert("se pudo agregar");
            ObtenerListadoProductos();
            // let alerta : string = ArmarAlert(resText.mensaje);
            // (<HTMLDivElement>document.getElementById("divResultado")).innerHTML = alerta;
        }
        else
        {
            alert("error")
            // let alerta : string = ArmarAlert(resText.mensaje, "danger");
            // (<HTMLDivElement>document.getElementById("divResultado")).innerHTML = alerta;
        }

    }
    catch(error)
    {
        console.log(error);
        alert(error);
    }
}

async function Modificar(e : any) : Promise<void> 
{  
    let jwt : string | null = localStorage.getItem("jwt");
    await VerificarJWT();

    let id:string = (<HTMLInputElement> document.getElementById("id_juguete")).value;
    let idInt = parseInt(id);
    let marca:string = (<HTMLInputElement> document.getElementById("txtMarca")).value;
    let precio:string = (<HTMLInputElement> document.getElementById("txtPrecio")).value;
    let precioINT = parseInt(precio);
    let foto:any = (<HTMLInputElement> document.getElementById("txtFoto"));
    let pathFoto = foto.files[0];

    let obj_prod = {
        "id_juguete": idInt,
        "marca": marca,
        "precio": precioINT
    };

    let form : FormData = new FormData();
    form.append('foto', pathFoto);
    form.append('juguete', JSON.stringify(obj_prod));

    const opciones = 
    {
        method: "PUT",
        headers : {'Authorization': 'Bearer ' + jwt},  //MÉTODO HTTP
        body: form
    }
    try
    {
        const res = await manejadorFetch(URL_API + "toys", opciones);

        const resText = await res.json();

        // if(resText.exito)
        // {
        //     let alerta : string = ArmarAlert(resText.mensaje);
        //     (<HTMLDivElement>document.getElementById("divResultado")).innerHTML = alerta;
        // }
        // else
        // {
        //     let alerta : string = ArmarAlert(resText.mensaje);
        //     (<HTMLDivElement>document.getElementById("divResultado")).innerHTML = alerta;
        // }

        alert("Se modifico correctamente");
        ObtenerListadoProductos();
    }
    catch
    {
        alert("Error");
    }
}

function Eliminar(e : any) : void 
{
    e.preventDefault();
    
    let id = (<HTMLInputElement>document.getElementById("id_juguete")).value;
    let juguete =  (<HTMLInputElement>document.getElementById("txtMarca")).value;
    if(confirm(`¿Seguro quieres eliminar el juguete ${id} y su marca ${juguete}`))
    {   
        ContinuarEliminar(id);
    }          
   // document.getElementById("btn_modal_confirm")?.click();

}

async function ContinuarEliminar(id : any) : Promise<void>
{
    let jwt : string | null = localStorage.getItem("jwt"); //recupero del localstorage
    await VerificarJWT();

    let idINT = parseInt(id);
    
    let obj_prod = {
        "id_juguete": idINT
    };

    const opciones = 
    {
        method: "DELETE",
        body: JSON.stringify(obj_prod),
        headers : {'Authorization': 'Bearer ' + jwt, 'Content-Type': 'application/json'} //MÉTODO HTTP
    }
    try
    {
        const res = await manejadorFetch(URL_API + "toys", opciones);

        const resText = await res.json();

        if(resText.exito)
        {
            alert(resText.mensaje);
            console.log(resText.mensaje);
            ObtenerListadoProductos();
        }
        else
        {
            alert(resText.mensaje);
            console.log(resText.mensaje);
        }
    }
    catch
    {
        alert("Error");
    }

}

//#endregion