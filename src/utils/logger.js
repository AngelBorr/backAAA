// src/utils/logger.js
import winston from 'winston'

const isProd = process.env.NODE_ENV === 'production'

const logger = winston.createLogger({
  level: isProd ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ level, message, timestamp }) => {
      return `[${timestamp}] [${level.toUpperCase()}] ${message}`
    })
  ),
  transports: [
    // Consola siempre
    new winston.transports.Console()
    // Si querés archivos en producción, podés agregar:
    // new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    // new winston.transports.File({ filename: 'logs/combined.log' })
  ]
})

// 🌐 Log normal → solo en dev
export const log = (...args) => {
  if (!isProd) {
    logger.debug(args.map(String).join(' '))
  }
}

// ⚠️ Advertencias → siempre
export const warn = (...args) => {
  logger.warn(args.map(String).join(' '))
}

// ❌ Errores → siempre
export const error = (...args) => {
  logger.error(args.map(String).join(' '))
}

// 🔐 Logs sensibles → solo datos en dev
export const secureLog = (...args) => {
  if (!isProd) {
    logger.debug(args.map(String).join(' '))
  } else {
    logger.info('[secureLog] Información sensible omitida en producción.')
  }
}

export default logger
