const express = require('express')
const logger = require('./utils/logger')

const config = require('./config')
const errorHandler = require('./api/libs/errorHandler')
//libs npm
const bodyParcer = require('body-parser')
const morgan = require('morgan')
const mongoose = require('mongoose')

//libs
const authJwt = require('./api/libs/auth')

//routes
const productosRoute = require('./api/recursos/productos/productos.route')
const usuariosRoute = require('./api/recursos/usuarios/usuarios.routes')

//Estrategia de autencicacion: 
const passport = require('passport')
const BasicStrategy = require('passport-http').BasicStrategy

// MongoDB -> NoSql -> no existen las tablas, sino colecciones de documentos
mongoose.connect('mongodb://127.0.0.1:27017/vendetusjuegos')
mongoose.connection.on('error', () => {
    logger.error('Fallo la conexion a mongodb')
    process.exit(1)
})

passport.use(authJwt)
const app = express()
app.use(bodyParcer.json())
app.use(morgan('short', {
    stream: {
        write: message => logger.info(message.trim())
    }
}))

app.use(passport.initialize())

app.use('/productos',productosRoute)
app.use('/usuarios', usuariosRoute)

app.use(errorHandler.processarDeBD)
if(config.ambiente === 'prod') {
    app.use(errorHandler.erroresEnProduction)
} else {
    app.use(errorHandler.eroresEnDesarrollo)
}

app.get('/', passport.authenticate('jwt',{session:false}), (req,res) => {
    logger.info(JSON.stringify(req.user))
    res.send('Api de vende tus juegos')
})

const server = app.listen(config.puerto, () => {
    logger.info('Escuchando en el puerto 3000')
});

module.exports = {
    app, server
}
