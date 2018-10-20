const express = require('express')
const _ = require("underscore")
//libs npm
const passport = require('passport')

//id universal unico
const uuidv4 = require('uuid/v4')

//productos
const productos  = require('./../../../database').productos
//mideware 
const {validarProducto} = require('./productos.validate')
//log
const log = require('../../../utils/logger')

// passport jwt
const jwtAuthenticate = passport.authenticate('jwt',{session:false});

//rotuer de express
const productosRouter = express.Router()

productosRouter.get('/',(req, res) => {
    res.json(productos)
})
//localhost:3000/productos
productosRouter.post('/',[jwtAuthenticate, validarProducto],(req,res) => {
    let nuevoProducto = {
        ...req.body,
        id:uuidv4(),
        dueno: req.user.username
    }
    productos.push(nuevoProducto)
    log.info("Producto agregado a la coleccion productos", nuevoProducto)
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
productosRouter.put('/:id', [ jwtAuthenticate, validarProducto], (req,res) => {
    let remplazoParaProducto = {
        ... req.body,
        id: req.params.id,
        dueno: req.user.username
    }
    let elIndice = _.findIndex(productos, producto => producto.id == remplazoParaProducto.id)
    
    if (elIndice !== -1) {
        if (productos[elIndice].dueno  !== remplazoParaProducto.dueno) {
            log.info(`Usuario ${req.user.username} no es dueno de producto con id ${remplazoParaProducto.id}, Dueno real es ${productos[elIndice].dueno}. Request no sera procesado`)
            res.status(401).send(`No eres dueno del producto con id ${remplazoParaProducto.id}. Solo puedes modificar productos creados por ti`);
            return
        }
        productos[elIndice] = remplazoParaProducto
        log.info(`Producto con id [${remplazoParaProducto.id}] remplazo con nuevo producto`, remplazoParaProducto) 
        res.status(200).json(remplazoParaProducto)
    } else {
        res.status(404).send(`El producto con id [${id}] no existe`)
    }
})

productosRouter.delete('/:id', jwtAuthenticate, (req,res) => { 
    let indiceABorrar = _.findIndex(productos, producto => producto.id == req.params.id)
    if (indiceABorrar === -1) {
        log.warn(`El producto con id [${req.params.id}] no existe. No hay nada que borrar`)
        res.status(404).send(`El producto con id [${req.params.id}] no existe. No hay nada que borrar`)
        return
    }

    if (productos[indiceABorrar].dueno  !== req.user.username) {
        log.info(`Usuario ${req.user.username} no es dueno de producto con id ${productos[indiceABorrar].id}, Dueno real es ${productos[indiceABorrar].dueno}. Request no sera procesado`)
        res.status(401).send(`No eres dueno del producto con id ${productos[indiceABorrar].id}. Solo puedes borrar productos creados por ti`);
        return
    }

    let borrado = productos.splice(indiceABorrar, 1)
    res.json(borrado);
})

module.exports = productosRouter;