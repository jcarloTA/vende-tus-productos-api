const mongoose = require('mongoose')
const log = require('./../../utils/logger')

exports.procesarErrores = (fn) => {
    return function(req, res, next) {
        fn(req, res, next).catch(next)
    }
}

exports.processarDeBD = (err, req, res, next) => {
    if(err instanceof mongoose.Error || err.name === 'MongoError') {
        log.error('Ocurrio un error relacionado a mongoose.',err)
        err.message = "Error relacionado a la base de datos, ocurrio inesperadamente. Para poder akyudarte contacta janta1696@gmail.com"
        err.status = 500
    }
    next(err)
}

exports.erroresEnProduction = (err, req, res, next) => {
    res.status(err.status || 500)
    res.send({
        message: err.message
    })
}

exports.eroresEnDesarrollo = (err, req, res, next) => {
    res.status(err.status || 500)
    console.log('error message', err.message)
    res.send({
        message: err.message,
        stack: err.stack || ''
    })
}
