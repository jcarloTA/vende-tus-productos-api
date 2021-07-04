const express = require('express')
const _ = require("underscore")
//libs npm
const passport = require('passport')
const procesarErrores = require('../../libs/errorHandler').procesarErrores
//mideware 
const {validarProducto, validarId} = require('./productos.validate')
const { ProductoNoExiste, UsuarioNoEsDueno} = require('./productos.error')
//log
const log = require('../../../utils/logger')

const productoController = require('./productos.controller');

// passport jwt
const jwtAuthenticate = passport.authenticate('jwt',{session:false});

//rotuer de express
const productosRouter = express.Router()

productosRouter.get('/', procesarErrores((req, res) => {
    return productoController.obtenerProductos()
    .then( productos => {
        res.json(productos)
    })
}))
//localhost:3000/productos
productosRouter.post('/',[jwtAuthenticate, validarProducto], procesarErrores((req,res) => {    
    return productoController.crearProducto(req.body, req.user.username)
    .then( producto => {
        log.info("Producto agregado a la coleccion productos", producto)
        res.status(201).json(producto)
    })
}))

productosRouter.get('/:id',validarId, procesarErrores((req,res) => {
    let id = req.params.id;
    return productoController.obtenerProducto(id)
    .then( (producto) => {
        if (!producto) throw new ProductoNoExiste(`Producto con id [${id}] no existe.`)
        res.json(producto)
    })
    //No found status 404
}))
// Con put no hay modificaciones parciales, se modifica completamente el recurso con uno nuevo.
productosRouter.put('/:id', [ jwtAuthenticate, validarProducto], procesarErrores(async (req,res) => {
    let id = req.params.id
    let requestUsuario = req.user.username
    let productoARemplazar

    productoARemplazar = await productoController.obtenerProducto(id)

    if (!productoARemplazar) {
       throw new ProductoNoExiste(`Producto con id [${id}] no existe.`)
    }
    
    if(productoARemplazar.dueno !== requestUsuario) {
        log.warn(`Usuario [${requestUsuario}] no es dueno del producto con id [${id}]. Dueno real es [${productoARemplazar.dueno}]. Request no sera procesado`)
        throw new UsuarioNoEsDueno(`No eres dueno del producto con id [${id}]. Solo puedes modificar productos creados por ti`)
    }
    
    productoController.reemplazarProducto(id, req.body, requestUsuario)
    .then( producto => {
        res.json(producto);
        log.info(`Producto con id [${id}] reemplazado con nuevo producto`, producto)
    })
}))

productosRouter.delete('/:id', [ jwtAuthenticate, validarId], procesarErrores(async (req,res) => { 
    let id = req.params.id
    let productoABorrar

    productoABorrar = await productoController.obtenerProducto(id)
    if (!productoABorrar) {
        log.info(`El producto con id [${id}] no existe. No hay nada que borrar`)
        throw new ProductoNoExiste(`El producto con id [${id}] no existe. No hay nada que borrar`)
    }

    let usuarioAutenticado = req.user.username 
    if (productoABorrar.dueno !== usuarioAutenticado) {
        log.info(`Usuario ${usuarioAutenticado} no es dueno de producto con id [${id}], Dueno real es [${productoABorrar.dueno}]. Request no sera procesado`)
        throw new UsuarioNoEsDueno(`No eres dueno del producto con id [${id}]. Solo puedes borrar productos creados por ti`);
    }

    let productoBorrado = await productoController.borrarProducto(id)
    log.info(`Producto con id [${id}] fue borrado`)
    res.json(productoBorrado)
}))

module.exports = productosRouter;