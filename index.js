const express = require('express')
const bodyParcer = require('body-parser')

//id universal unico
const uuidv4 = require('uuid/v4')

const app = express()
//Todos los request que entren pasen por el middeware que nos retorna esta llamada a bodyparcer.json
app.use(bodyParcer.json())

//Base de datos en memoria
const productos = [
    { id: '1',titulo:'The Wicther', precio: 500, moneda: 'USD'},
    { id: '2',titulo:'Fallaut 4', precio: 1200, moneda: 'USD'},
    { id: '3',titulo:'Playerknowsbatlegrounds', precio: 700, moneda: 'USD'}
]

app.route('/productos')
    .get((req, res) => {
        res.json(productos)
    })
    .post((req,res) => {
        let nuevoProducto = req.body 
        //input validation
        if (!nuevoProducto.moneda || !nuevoProducto.precio || !nuevoProducto.titulo) {
        // Bad request 400 -- no cumple los requisitos para ser un request valido
            res.status(400).send("Tu producto debe especificar un titulo, precio y moneda")
            return // terminar la ejecucion
        }
        nuevoProducto.id = uuidv4()
        productos.push(nuevoProducto)
        // Created 201 -- El request resulto la creacion de un nuevo recurso
        res.status(201).json(nuevoProducto)
    })

app.get('/productos/:id', (req,res) => {
    for (let producto of productos) {
        if (producto.id == req.params.id) {
            res.json(producto)
            return
        }
    }
    //No found status 404
    res.status(404).send(`El producto con id [${req.params.id}] no existe`);
})

app.get('/', (req,res) => {
    res.send('Api de vende tus juegos')
})

app.listen(3000, () => {
    console.log("Escuchando en el puerto 3000")
})