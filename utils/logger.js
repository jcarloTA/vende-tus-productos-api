const winston = require('winston')

module.exports = winston.createLogger({
    level: 'debug',
    format: winston.format.combine(winston.format.colorize(),winston.format.simple()),
    transports: [
        new winston.transports.Console({
            handleExceptions: true
        }),
        new winston.transports.File({
            level: 'info',
            format: winston.format.timestamp(),
            handleExceptions: true,
            maxsize:5120000, // 5 MB,
            maxFiles: 5,
            filename: `${__dirname}/../logs/logs-de-aplicacion.log`,
        })
    ],
})