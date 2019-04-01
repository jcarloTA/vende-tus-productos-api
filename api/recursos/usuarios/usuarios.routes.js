const express = require('express')

const _ = require('underscore')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const log = require('../../../utils/logger')
const { validarUsuario, validarPedidoDeLogin } = require('./usuarios.validate')


const config = require('../../../config')

const usuarioController = require('./usuarios.controller');
 
const usuariosRouter = express.Router();

function transformarBodyALowerCase(req,res,next) {
    req.body.username && (req.body.username = req.body.username.toLowerCase());
    req.body.email && (req.body.email = req.body.email.toLowerCase());
    next();
}

usuariosRouter.get('/', (req,res) => {
    usuarioController.obtenerUsuarios().then( (usuarios) => {
        res.json(usuarios)
    })
    .catch( (err) => {
        log.error('Error al obtener todos los usuarios');
        res.sendStatus(599)
    })
})

usuariosRouter.post('/',[validarUsuario, transformarBodyALowerCase], (req, res) => {
    let nuevoUsuario = req.body
    
    usuarioController.usuarioExiste(nuevoUsuario.username, nuevoUsuario.email)
        .then( (usuarioExiste) => {
            if (usuarioExiste) {
                log.warn(`Email [${nuevoUsuario.email}] o username [${nuevoUsuario.username}] ya existe en la base de datos`)
                res.status(409).send('El email o usuario ya exite')
                return
            }

            bcrypt.hash(nuevoUsuario.password, 10, (err, hashedPassword) => {
                if (err) {
                    // Internal server error
                    log.error('Error ocurrio al tratar de obtener el hash de una contrasenia', err)
                    res.status(500).send("Ocurrio un error procesando creacion del usuario")
                    return
                }

                usuarioController.crearUsuario(nuevoUsuario, hashedPassword)
                    .then( (nuevoUsuario) => {
                        res.status(201).send('Usuario creado exitosamente')
                    })
                    .catch( (err) => {
                        log.error("Error ocurrion al tratar de crear nuevo usuario",err);
                        res.status(500).send("Error ocurrio al tratar de crear un usuario")
                    })
            })
        })
        .catch(err => {
            log.error(`Error ocurrio al tratar de verificar si usuario [${nuevoUsuario.username}] con email [${nuevoUsuario.email}] ya existe`)
            res.status(500).send('Error ocurrio al tratar de crear nuevo usuario.')
        })
})

usuariosRouter.post('/login',[validarPedidoDeLogin, transformarBodyALowerCase], async (req, res) => {
    let usuarioNoAutenticado = req.body
    let usuarioRegistrado 

    try {
        usuarioRegistrado = await usuarioController.obtenerUsuario({
            username: usuarioNoAutenticado.username
        })
    } catch (err) {
        log.error(`Error ocurrio al tratar de determinar si el usuario [${usuarioNoAutenticado.username}] ya existe`, err)
        res.status(500).send('Error ocurrio durante el proceso de login.')
        return
    }
    

    console.log('usuarioRegistrado', usuarioRegistrado)
    console.log('usuarioNoAutenticado',usuarioNoAutenticado)
    if (!usuarioRegistrado) {
        log.info(`Usuario [${usuarioNoAutenticado.username}] no existe. No pudo ser autenticado`)
        res.status(400).send(`Credenciales incorrectas. Asegurate que el username y contrasenioa sean correctas`)
        return
    }

    let contraseniaCorrecta 
    try {
        contraseniaCorrecta = await bcrypt.compare(usuarioNoAutenticado.password,usuarioRegistrado.password)
        if (contraseniaCorrecta) {
            //Generar y enviar token
            let token = jwt.sign({id: usuarioRegistrado.id}, config.jwt.secreto, { expiresIn: config.jwt.tiempoDeExpiracion })
            log.info(`Usuario ${usuarioNoAutenticado.username} completo autenticacion exitosamante`)
            res.status(200).json({ token })
        } else {
            log.info(`Usuario ${usuarioNoAutenticado.username} no completo autenticacion, contrasenia incorrecta`)
            res.status(400).send('Credenciales incorrectas. Asegurate que el username y contraseña sean correctas.')
        }
    } catch (err) {
        log.error(`Error ocurrio al tratar de verificar si la contrasenia es correcta`, err);
        res.status(500).send('Error ocurrio durante el proceso de login')
        return
    }

})
module.exports = usuariosRouter;