const Joi = require('joi')
const log = require('../../../utils/logger')

//hojas azules de arquitecto
const blueprintProducto = Joi.object().keys({
    titulo: Joi.string().max(100).required(),
    precio: Joi.number().positive().precision(2).required(),
    moneda: Joi.string().length(3).uppercase()
})

//moddeware -- funcion intermedia que va hacer algo antes del proceso
const validarProducto = (req, res, next) => {
    let resultado = Joi.validate(req.body,blueprintProducto, {abortEarly:false,convert:false})
    if (resultado.error === null) {
        next()
        return
    } else  {
        let erroresDeValidacion = resultado.error.details.reduce( (acumulador, error) => {
            return acumulador + `[${error.message}]`
        }, "")
        log.warn('El siguiente producto no paso la validacion: ', req.body, erroresDeValidacion)
        res.status(400).send(`El producto en el body debe especificar titulo, precio y moneda. Errores en tu request: ${erroresDeValidacion}`)
    }
}

module.exports = {
    validarProducto
}