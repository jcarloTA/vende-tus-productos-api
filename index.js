const express = require('express')
const bodyParcer = require('body-parser')
const productosRoute = require('./api/recursos/productos/productos.route');


const app = express()
//Todos los request que entren pasen por el middeware que nos retorna esta llamada a bodyparcer.json
app.use(bodyParcer.json())

app.use('/productos',productosRoute)

app.get('/', (req,res) => {
    res.send('Api de vende tus juegos')
})

app.listen(3000, () => {
    console.log("Escuchando en el puerto 3000")
})