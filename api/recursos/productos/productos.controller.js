//modelo de producto
const Producto = require('./productos.model');

/* 
    Uni Tests: Preuba la logica del codigo, que funcione bien.
    - Verificar logica de cada modulo y funcion de forma isolada
    - Son test que no requieren que el servidor este corriendo
    - Se utilizan Mocks para imitar dependencias
    - Por ejemplo, servicios externos o bases de datos son imitadas con objetos inteligentes
*/
 
/* Integration Tests: Estamos probando la integracion de todas nuestras piezas en nuestro sistema,
        tenemos nuestro server corriendo, y tenemos nuestros archivos automaticos que mandan request a nuestro servidor.
    - Verificar que todas las unidades funcionan de forma esperada en conjunto
    - En el caso de un servidor, corremos el servidor y le enviamos requests mediante un script en el mismo servidor u otra maquina
    - Verificamos que los reponses del servidor son correctos, y que la base de datos tiene la informacion esperada
*/

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