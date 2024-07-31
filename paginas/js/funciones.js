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
const URL_API = "http://localhost:12724/";
const URL_BASE = "http://localhost/Quintana.ManuelParte3/paginas/";
const manejadorFetch = (url, options) => __awaiter(void 0, void 0, void 0, function* () {
    return yield fetch(url, options)
        .then(manejadorError);
});
const manejadorError = (res) => {
    if (!res.ok) {
        throw new Error(res.statusText);
    }
    return res;
};
function ArmarAlert(mensaje, tipo = "success") {
    let alerta = '<div id="alert_' + tipo + '" class="alert alert-' + tipo + ' alert-dismissable">';
    alerta += '<button type="button" class="close" data-dismiss="alert">&times;</button>';
    alerta += '<span class="d-inline-block text-truncate" style="max-width: 450px;">' + mensaje + ' </span></div>';
    return alerta;
}
function Fail(retorno) {
    console.error(retorno.toString());
    let alerta = ArmarAlert(retorno.toString(), "danger");
}
//# sourceMappingURL=funciones.js.map