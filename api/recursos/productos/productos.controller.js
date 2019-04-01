//modelo de producto
const Producto = require('./productos.model');


function crearProducto(producto, dueno) {

    return new Producto({
        ...producto,
        dueno
    }).save()
}

function obtenerProductos() {
    return Producto.find({})
}

function obtenerProducto(id) {
    return Producto.findById(id)
}

function borrarProducto(id) {
    return Producto.findByIdAndRemove(id)
}

function reemplazarProducto(id, producto, username) {
    return Producto.findOneAndUpdate({_id: id}, {
        ...producto,
        dueno: username
    },{
        new: true
    })
}
module.exports = {
    crearProducto,
    obtenerProductos,
    obtenerProducto,
    borrarProducto,
    reemplazarProducto
}