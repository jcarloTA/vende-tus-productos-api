const Joi = require('joi')
const log = require('../../../utils/logger')

const plueprintUsuario = Joi.object().keys({
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().min(6).max(200).required(),
    email: Joi.string().email().required()
})


const validarUsuario = (req, res, next) => {
    const resultado = Joi.validate(req.body, plueprintUsuario, {abortEarly: false, convert: false})

    if (resultado.error === null) {
        next()
    } else {
        // Bad request
        log.info("Usuario fallo la validacion", resultado.error.details.map( error => error.message))
        res.status(400).send("Informacion del usuario no cumple los requisitos. El nombre del usuario debe ser alfanumerico y tener 3 y 30 caractares. La contasenia debe tener entre 6 y 200 caracteres. Asegurate de que el email sea valido.")
    }
}

const blueprintPedidoDeLogin = Joi.object().keys({
    username: Joi.string().required(),
    password: Joi.string().required()
})

let validarPedidoDeLogin = (req, res, next) => {
    const resultado = Joi.validate(req.body, blueprintPedidoDeLogin, {convert: false, abortEarly: false})

    if(resultado.error === null) {
        next()
    } else {
        res.status(400).send("Login fallo. Debes especificar el username y constrasenia del usuario. Ambos deben ser strings")
    }
}

module.exports = {
    validarPedidoDeLogin,
    validarUsuario
}