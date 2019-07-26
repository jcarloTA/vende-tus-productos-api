const express = require('express')

const _ = require('underscore')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const log = require('../../../utils/logger')
const { validarUsuario, validarPedidoDeLogin } = require('./usuarios.validate')
const { DatosDeUsuarioYaEnUso, CredencialesIncorrectas } = require('./usuarios.error')

const procesarErrores = require('../../libs/errorHandler').procesarErrores

const config = require('../../../config')

const usuarioController = require('./usuarios.controller');
 
const usuariosRouter = express.Router();

function transformarBodyALowerCase(req,res,next) {
    req.body.username && (req.body.username = req.body.username.toLowerCase());
    req.body.email && (req.body.email = req.body.email.toLowerCase());
    next();
}

usuariosRouter.get('/', procesarErrores((req,res) => {
    return usuarioController.obtenerUsuarios().then( (usuarios) => {
        res.json(usuarios)
    })
}))

usuariosRouter.post('/',[validarUsuario, transformarBodyALowerCase], procesarErrores((req, res) => {
    let nuevoUsuario = req.body
    
    return usuarioController.usuarioExiste(nuevoUsuario.username, nuevoUsuario.email)
        .then( (usuarioExiste) => {
            if (usuarioExiste) {
                log.warn(`Email [${nuevoUsuario.email}] o username [${nuevoUsuario.username}] ya existe en la base de datos`)
                throw new DatosDeUsuarioYaEnUso()
            }

            return bcrypt.hash(nuevoUsuario.password, 10)
        })
        .then(  (hashedPassword) => {
            return usuarioController.crearUsuario(nuevoUsuario, hashedPassword)
        })
        .then( (nuevoUsuario) => {
            res.status(201).send('Usuario creado exitosamente')
        })
}))

usuariosRouter.post('/login',[validarPedidoDeLogin, transformarBodyALowerCase], procesarErrores(async (req, res) => {
    let usuarioNoAutenticado = req.body
    let usuarioRegistrado 

    usuarioRegistrado = await usuarioController.obtenerUsuario({
        username: usuarioNoAutenticado.username
    })

    if (!usuarioRegistrado) {
        log.info(`Usuario [${usuarioNoAutenticado.username}] no existe. No pudo ser autenticado`)
        throw new CredencialesIncorrectas();
    }

    let contraseniaCorrecta 
    contraseniaCorrecta = await bcrypt.compare(usuarioNoAutenticado.password,usuarioRegistrado.password)
    if (contraseniaCorrecta) {
        //Generar y enviar token
        let token = jwt.sign({id: usuarioRegistrado.id}, config.jwt.secreto, { expiresIn: config.jwt.tiempoDeExpiracion })
        log.info(`Usuario ${usuarioNoAutenticado.username} completo autenticacion exitosamante`)
        res.status(200).json({ token })
    } else {
        log.info(`Usuario ${usuarioNoAutenticado.username} no completo autenticacion, contrasenia incorrecta`)
        throw new CredencialesIncorrectas();        
    }
}))
module.exports = usuariosRouter;