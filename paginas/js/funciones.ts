const URL_API : string = "http://localhost:12724/";
//CAMBIAR POR SU URL_BASE...
const URL_BASE : string = "http://localhost/Quintana.ManuelParte3/paginas/";

const manejadorFetch = async (url : string, options : RequestInit):Promise<Response> => 
{
    return await fetch(url, options)
        .then(manejadorError);
};

const manejadorError = (res:Response):Response => 
{
    if ( ! res.ok)
    {
        throw new Error(res.statusText);
    } 

    return res;
};
    
function ArmarAlert(mensaje:string, tipo:string = "success"):string
{
    let alerta:string = '<div id="alert_' + tipo + '" class="alert alert-' + tipo + ' alert-dismissable">';
    alerta += '<button type="button" class="close" data-dismiss="alert">&times;</button>';
    alerta += '<span class="d-inline-block text-truncate" style="max-width: 450px;">' + mensaje + ' </span></div>';

    return alerta;
}

function Fail(retorno:any):void {

    console.error(retorno.toString());
    let alerta:string = ArmarAlert(retorno.toString(), "danger");
    

    // if((<HTMLDivElement>document.getElementById("div_mensaje")) !== null){
    //     (<HTMLDivElement>document.getElementById("div_mensaje")).innerHTML = alerta;
    // }
    // else{
    //     (<HTMLDivElement>document.getElementById("divResultado")).innerHTML = alerta;
    // }
}