const log = require('./../../utils/logger')
const bcrypt = require('bcrypt')

const passportJWT = require('passport-jwt')
const config = require('../../config')
const usuarioController = require('../recursos/usuarios/usuarios.controller')
//Token debe ser espificado mediante el header "Authorizacion" . Ejemplo
// Authorization: bearer xxxx.yyyy.xxxx

let jwtOptions = {
    secretOrKey: config.jwt.secreto,
    jwtFromRequest: passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken()
}

module.exports = new passportJWT.Strategy(jwtOptions, (jwtPayload, next) => {

    usuarioController.obtenerUsuario({id: jwtPayload.id }).then( usuario => {
        if(!usuario) {
            log.info(`JWT token no es valido. Usuario con id ${jwtPayload.id} no existe.`)
            next(null, false)
            return
        }
        log.info(`Usuario ${usuario.username} suministro un token valido. Autenticacion completada.`)
        next(null, {
            username: usuario.username,
            id: usuario.id
        })

    })
    .catch( err => {
        console.log('usuario no valido')
        log.error("Error ocurrio al tratar de validar un token", err)
        next(err)
    })

})
