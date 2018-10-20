const ambiente = process.env.NODE_ENV || 'develoment'

const configuarcionBase = {
    jwt: {},
    puerto: 3000
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
    default:
        configuracionDeAmbiente = require('./dev')
}

module.exports = {
    ...configuarcionBase,
    ...configuracionDeAmbiente
}