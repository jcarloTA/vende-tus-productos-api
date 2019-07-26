

class DatosDeUsuarioYaEnUso extends Error {
    constructor(message) {
        super(message)
        this.message = message || 'El email o usuario ya estan asociados con una cuenta.'
        this.status = 409
        this.name = "DatosDeUsuarioYaEnUso"
    }
}

class CredencialesIncorrectas extends Error {
    constructor(message) {
        super(message)
        this.message = message || 'Credenciales incorrectas. Asegurate que el username y contrasena sean correctas'
        this.status = 400
        this.name = "Credenciales"
    }
}

module.exports = {
    DatosDeUsuarioYaEnUso,
    CredencialesIncorrectas
}