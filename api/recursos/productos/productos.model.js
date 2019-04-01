const mongose = require('mongoose')

const productoSchema = new mongose.Schema({
    titulo: {
        type: String,
        required: [true, 'Producto debe tener un titulo']
    },
    precio: {
        type: Number,
        min: 0,
        required: [true, 'Producto debe tener un precio']
    },
    moneda: {
        type: String,
        maxlength: 3,
        minlength: 3,
        required: [true,'Producto debe tener una moneda']
    },
    dueno: {
        type: String,
        required: [true, 'Producto debe estar asociado a un usuario']
    }
}) 

module.exports = mongose.model('producto', productoSchema);