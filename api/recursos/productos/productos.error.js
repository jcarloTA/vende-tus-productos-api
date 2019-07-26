
class ProductoNoExiste extends Error {
    constructor(message) {
        super(message)
        this.message = message || 'Producto no existe, Operacion no puede ser completada'
        this.status = 404
        this.name = 'ProductoNoExiste'
    }
}

class UsuarioNoEsDueno extends Error {
    constructor(message) {
        super(message)
        this.message = message || 'No eres dueno del producto. Operacion no puede ser completada.'
        this.status = 401
        this.name = 'UsuarioNoEsDueno'
    }
}

module.exports = {
    ProductoNoExiste,
    UsuarioNoEsDueno
}

