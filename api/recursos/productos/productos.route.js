const express = require('express')
const _ = require("underscore")
//libs npm
const passport = require('passport')

//id universal unico
const uuidv4 = require('uuid/v4')

//mideware 
const {validarProducto, validarId} = require('./productos.validate')
//log
const log = require('../../../utils/logger')

const productoController = require('./productos.controller');

// passport jwt
const jwtAuthenticate = passport.authenticate('jwt',{session:false});

//rotuer de express
const productosRouter = express.Router()

productosRouter.get('/',(req, res) => {
    productoController.obtenerProductos()
    .then( productos => {
        res.json(productos)
    })
    .catch( err => {
        res.status(500).send("Error al leer los productos a la base de datos.")
    })
})
//localhost:3000/productos
productosRouter.post('/',[jwtAuthenticate, validarProducto],(req,res) => {    
    productoController.crearProducto(req.body, req.user.username)
    .then( producto => {
        log.info("Producto agregado a la coleccion productos", producto)
        res.status(201).json(producto)
    })
    .catch( err => {
        log.error("Producto no pudo ser creado", err)
        res.status(500).send("Error ocurrio al tratar de crear el producto")
    })
})

productosRouter.get('/:id',validarId,(req,res) => {
    let id = req.params.id;
    productoController.obtenerProducto(id)
    .then( (producto) => {
        if (!producto) {
             res.status(404).send(`Producto con id [${id}] no existe.`)
        } else {
            res.json(producto)
        }
    })
    .catch( (err) => {
        log.error(`Excepcion ocurrio al tratar de obtener un producto con id [${id}]`,err);
        res.status(500).send(`Error ocurrio obteniendo producto con id [${id}]`)
    })
    //No found status 404
})
// Con put no hay modificaciones parciales, se modifica completamente el recurso con uno nuevo.
productosRouter.put('/:id', [ jwtAuthenticate, validarProducto], async (req,res) => {
    let id = req.params.id
    let requestUsuario = req.user.username
    let productoARemplazar

    try {
        productoARemplazar = await productoController.obtenerProducto(id)
    } catch (err) {
        log.warn(`Excepcion ocurrio al procesar la modificacion del producto con id [${id}]`, err)
        res.status(500).send(`Error ocurrion modificando producto con id [${id}]`)
        return
    }

    if (!productoARemplazar) {
        res.status(404).send(`El producto con id [${id}] no existe`)
    }
    
    if(productoARemplazar.dueno !== requestUsuario) {
        log.warn(`Usuario [${requestUsuario}] no es dueno del producto con id [${id}]. Dueno real es [${productoARemplazar.dueno}]. Request no sera procesado`)
        res.status(401).send(`No eres dueno del producto con id [${id}]. Solo puedes modificar productos creados por ti`)
        return;
    }

    let elIndice = _.findIndex(productos, producto => producto.id == remplazoParaProducto.id)
    
    productoController.remplazoParaProducto(id, req.body, requestUsuario)
    .then( producto => {
        res.json(producto);
        log.info(`Producto con id [${id}] reemplazado con nuevo producto`, producto)
    })
    .catch( (err) => {
        log.error(`Excepcion al tratar de remplazar producto con id [${id}]`, err);
        res.status(500).send(`Error ocurrio remplazando producto con id [${id}]`)
    })
})

productosRouter.delete('/:id', [ jwtAuthenticate, validarId], async (req,res) => { 
    let id = req.params.id
    let productoABorrar

    try {
        productoABorrar = await productoController.obtenerProducto(id)

    } catch (err) {
        log.error(`Exepcion ocurrio al procesar el borrado de producto con id [${id}]`, err)
        res.status(500).send(`Error ocurrio borrando producto con id [${id}]`)
        return
    }    
    if (!productoABorrar) {
        log.info(`El producto con id [${id}] no existe. No hay nada que borrar`)
        res.status(404).send(`El producto con id [${id}] no existe. No hay nada que borrar`)
        return
    }

    let usuarioAutenticado = req.user.username 
    if (productoABorrar.dueno !== usuarioAutenticado) {
        log.info(`Usuario ${usuarioAutenticado} no es dueno de producto con id [${id}], Dueno real es [${productoABorrar.dueno}]. Request no sera procesado`)
        res.status(401).send(`No eres dueno del producto con id [${id}]. Solo puedes borrar productos creados por ti`);
        return
    }

    try {
        let productoBorrado = await productoController.borrarProducto(id)
        log.info(`Producto con id [${id}] fue borrado`)
        res.json(productoBorrado)
    } catch (err) {
        res.status(500).send(`Error ocurrio borrando producton con id [${id}]`)
    }
})

module.exports = productosRouter;