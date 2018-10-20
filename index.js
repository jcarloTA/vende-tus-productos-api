const express = require('express')
const logger = require('./utils/logger')

const config = require('./config')

//libs npm
const bodyParcer = require('body-parser')
const morgan = require('morgan')

//libs
const authJwt = require('./api/libs/auth')

//routes
const productosRoute = require('./api/recursos/productos/productos.route')
const usuariosRoute = require('./api/recursos/usuarios/usuarios.routes')

//Estrategia de autencicacion: 
const passport = require('passport')
const BasicStrategy = require('passport-http').BasicStrategy;

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

app.get('/', passport.authenticate('jwt',{session:false}), (req,res) => {
    logger.info(JSON.stringify(req.user))
    res.send('Api de vende tus juegos')
})

app.listen(config.puerto, () => {
    logger.info('Escuchando en el puerto 3000')
})