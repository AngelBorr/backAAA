// src/controllers/controller.emailLog.js
import EmailLogService from '../services/emailLog.service.js'
import { log, warn, error as logError } from '../utils/logger.js'

const emailLogService = new EmailLogService()

/* -------------------------------------------------------------
   📌 GET → Todos los logs
------------------------------------------------------------- */
export const getAllEmailLogs = async (req, res, next) => {
  try {
    log('📥 Controller → getAllEmailLogs')

    const logs = await emailLogService.getAllLogs()

    return res.status(200).json({
      success: true,
      data: logs,
      message: 'Registros de email obtenidos correctamente'
    })
  } catch (err) {
    logError('❌ Error en getAllEmailLogs:', err.message)
    err.statusCode = 500
    return next(err)
  }
}

/* -------------------------------------------------------------
   📌 GET → Logs por email
------------------------------------------------------------- */
export const getEmailLogsByEmail = async (req, res, next) => {
  try {
    const { email } = req.params
    log(`📥 Controller → getEmailLogsByEmail (${email})`)

    const logs = await emailLogService.getLogsByEmail(email)

    return res.status(200).json({
      success: true,
      data: logs,
      message: `Logs obtenidos para: ${email}`
    })
  } catch (err) {
    logError('❌ Error en getEmailLogsByEmail:', err.message)

    if (err.message.includes('email válido')) err.statusCode = 400
    else err.statusCode = 500

    return next(err)
  }
}
