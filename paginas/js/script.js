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
    document.getElementById("btnEnviar").onclick = (e) => {
        e.preventDefault();
        Main.Login();
    };
});
var Main;
(function (Main) {
    function Login() {
        return __awaiter(this, void 0, void 0, function* () {
            let correo = document.getElementById("correo").value;
            let clave = document.getElementById("clave").value;
            let dato = {};
            dato.correo = correo;
            dato.clave = clave;
            let form = new FormData();
            form.append('obj_usuario', JSON.stringify(dato));
            const opciones = {
                method: "POST",
                body: JSON.stringify(dato),
                headers: { "Accept": "*/*", "Content-Type": "application/json" },
            };
            try {
                let res = yield manejadorFetch(URL_API + "login", opciones);
                let obj_ret = yield res.json();
                console.log(obj_ret);
                let alerta = "";
                if (obj_ret.exito) {
                    localStorage.setItem("jwt", obj_ret.jwt);
                    setTimeout(() => {
                        location.assign(URL_BASE + "principal.html");
                    }, 2000);
                    alert("redirigiendo al principal.php...");
                }
                else {
                    alert("Error");
                }
                alert(alerta);
            }
            catch (err) {
                alert("Correo o clave incorrectos");
            }
        });
    }
    Main.Login = Login;
})(Main || (Main = {}));
//# sourceMappingURL=script.js.map