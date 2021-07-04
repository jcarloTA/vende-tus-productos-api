const ambiente = process.env.NODE_ENV || 'develoment'

const configuarcionBase = {
    jwt: {},
    puerto: 3000,
    suprimirLogs: false
}

let configuracionDeAmbiente = {}

switch (ambiente) {

    case 'desarollo':
    case 'dev':
    case 'develoment':
        configuracionDeAmbiente = require('./dev')
        break
    case 'produccion':
    case 'prod':
        configuracionDeAmbiente = require('./prod')
        break
    case 'test':
        configuracionDeAmbiente = require('./test')
        break;
    default:
        configuracionDeAmbiente = require('./dev')
}

let amg = {
    ...configuarcionBase,
    ...configuracionDeAmbiente
}

module.exports = {
    ...configuarcionBase,
    ...configuracionDeAmbiente
}