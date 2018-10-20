const express = require('express')

const _ = require('underscore')
const uuidv4 = require('uuid/v4')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const log = require('../../../utils/logger')
const { validarUsuario, validarPedidoDeLogin } = require('./usuarios.validate')

const usuarios = require('../../../database').usuarios

const config = require('../../../config')

const usuariosRouter = express.Router()

usuariosRouter.get('/', (req,res) => {
    res.json(usuarios)
})

usuariosRouter.post('/',validarUsuario, (req, res) => {
    let nuevoUsuario = req.body
    
    let indice = _.findIndex(usuarios, usuario => usuario.username === nuevoUsuario.username || usuario.email === nuevoUsuario.email)

    if (indice !== -1) {
        log.info('Email o usarname ya existen en la base de datos')
        res.status(409).send('El email o usarname ya estan asociados a una cuenta.')
        return
    }

    bcrypt.hash(nuevoUsuario.password, 10, (err, hashedPassword) => {
        if (err) {
            // Internal server error
            log.error('Error ocurrio al tratar de obtener el hash de una contrasenia', err)
            res.status(500).send("Ocurrio un error procesando creacion del usuario")
            return
        }

        usuarios.push({
            username: nuevoUsuario.username,
            email: nuevoUsuario.email,
            password: hashedPassword,
            id: uuidv4()
        })

        res.status(201).send('Usuario creado exitosamente')
    })
})

usuariosRouter.post('/login',validarPedidoDeLogin, (req, res) => {
    let usuarioNoAutenticado = req.body
    let index = _.findIndex(usuarios, usuario => usuario.username === usuarioNoAutenticado.username)

    if (index === -1) {
        log.info(`Usuario ${usuarioNoAutenticado.username} no existe. No pudo ser autenticado`)
        res.status(400).send('Credenciales incorrectas. El usuario no existe')
        return
    }

    let hashedPassword = usuarios[index].password
    bcrypt.compare(usuarioNoAutenticado.password, hashedPassword, (err, iguales) => {
        if (iguales) {
            //Generar y enviar token
            let token = jwt.sign({id: usuarios[index].id}, config.jwt.secreto, { expiresIn: config.jwt.tiempoDeExpiracion })
            log.info(`Usuario ${usuarioNoAutenticado.username} completo autenticacion exitosamante`)
            res.status(200).json({ token })
        } else {
            log.info(`Usuario ${usuarioNoAutenticado.username} no completo autenticacion, contrasenia incorrecta`)
            res.status(400).send('Credenciales incorrectas. Asegurate que el username y contraseña sean correctas.')
        }
    })
})
module.exports = usuariosRouter;