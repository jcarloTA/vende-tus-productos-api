const express = require('express')
const _ = require("underscore")
//id universal unico
const uuidv4 = require('uuid/v4')
const productos  = require('./../../../database').productos
const {validarProducto} = require('./productos.validate')


//rotuer de express
const productosRouter = express.Router()

productosRouter
.get('/',(req, res) => {
    res.json(productos)
})
//localhost:3000/productos
productosRouter.post('/',validarProducto,(req,res) => {
    let nuevoProducto = req.body 

    nuevoProducto.id = uuidv4()
    productos.push(nuevoProducto)
    // Created 201 -- El request resulto la creacion de un nuevo recurso
    res.status(201).json(nuevoProducto)
})

productosRouter.get('/:id',(req,res) => {
    for (let producto of productos) {
        if (producto.id == req.params.id) {
            res.json(producto)
            return
        }
    }
    //No found status 404
    res.status(404).send(`El producto con id [${req.params.id}] no existe`)
})
// Con put no hay modificaciones parciales, se modifica completamente el recurso con uno nuevo.
productosRouter.put('/:id', validarProducto, (req,res) =>{
    let id = req.params.id
    let remplazoParaProducto = req.body

    let elIndice = _.findIndex(productos, producto => producto.id == id)
    
    if (elIndice !== -1) {
        //remplazo
        remplazoParaProducto.id = id
        productos[elIndice] = remplazoParaProducto
        res.status(200).json(remplazoParaProducto)
    } else {
        res.status(404).send(`El producto con id [${id}] no existe`)
    }
})

productosRouter.delete('/:id',(req,res) => {
    let id = req.params.id
    let indiceABorrar = _.findIndex(productos, producto => producto.id == id)
    if (indiceABorrar === -1) {
        res.status(404).send(`El producto con id [${id}] no existe. No hay nada que borrar`)
        return
    }

    let borrado = productos.splice(indiceABorrar, 1)
    res.json(borrado);
})

module.exports = productosRouter;