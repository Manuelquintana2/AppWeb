window.addEventListener("load", ():void => {
 
    (<HTMLInputElement>document.getElementById("btnEnviar")).onclick = (e:any)=>{

        e.preventDefault();

        Main.Login();
    }

});

namespace Main{

    export async function Login() {

        let correo = (<HTMLInputElement>document.getElementById("correo")).value;
        let clave = (<HTMLInputElement>document.getElementById("clave")).value;

        let dato:any = {};
        dato.correo = correo;
        dato.clave = clave;

        let form : FormData = new FormData();
        form.append('obj_usuario', JSON.stringify(dato));

        const opciones = {
            method: "POST",
            body: JSON.stringify(dato),//dato,
            headers: {"Accept": "*/*", "Content-Type": "application/json"},
        };

        try {

            let res = await manejadorFetch(URL_API + "login", opciones);
        
            let obj_ret = await res.json(); 
            
            console.log(obj_ret);

            let alerta:string = "";

            if(obj_ret.exito){
                //GUARDO EN EL LOCALSTORAGE
                localStorage.setItem("jwt", obj_ret.jwt);                

                //alerta = ArmarAlert(obj_ret.mensaje + " redirigiendo al principal.php...");
    
                setTimeout(() => {
                    location.assign(URL_BASE + "principal.html");
                }, 2000);
                alert("redirigiendo al principal.php...");
            }
            else
            {
                alert("Error");
            }

            alert(alerta);
            //(<HTMLDivElement>document.getElementById("div_mensaje")).innerHTML = alerta;

        } catch (err:any) {
        
            alert("Correo o clave incorrectos");
        }
    }

}