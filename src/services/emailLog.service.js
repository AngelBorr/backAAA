// src/services/emailLog.service.js
import EmailLogManager from '../dao/managers/mongo/emailLog.mongo.js'
import EmailLogModel from '../dao/models/emailLog.model.js'
import { log, warn, error as logError, secureLog } from '../utils/logger.js'

class EmailLogService {
  constructor() {
    this.emailLogDAO = new EmailLogManager()
  }

  normalizeEmail(email) {
    return String(email || '')
      .trim()
      .toLowerCase()
  }

  /* -------------------------------------------------------------
      📌 ADD — guardar un nuevo log (NO rompe flujo)
  ------------------------------------------------------------- */
  async addLog({ userId = null, email, type, status, errorMessage = null, payload = null }) {
    try {
      const normalizedEmail = this.normalizeEmail(email)

      log(`📨 EmailLogService → guardando log (${status}) para ${normalizedEmail}`)

      // Sanitizamos payload (si es muy grande, lo truncamos)
      let safePayload = payload
      try {
        const json = JSON.stringify(payload)
        if (json.length > 5000) {
          warn('⚠ Payload demasiado grande → se guardará truncado.')
          safePayload = { truncated: true }
        }
      } catch {
        safePayload = { invalid: true }
      }

      return await this.emailLogDAO.createLog({
        userId,
        email: normalizedEmail,
        type,
        status,
        errorMessage,
        payload: safePayload
      })
    } catch (err) {
      logError('❌ Error EmailLogService.addLog:', err.message)
      return null // los logs NO deben interrumpir la app
    }
  }

  /* -------------------------------------------------------------
      📌 GET — obtener todos los logs
  ------------------------------------------------------------- */
  async getAllLogs() {
    try {
      log('📥 EmailLogService → getAllLogs')

      const logs = await EmailLogModel.find().sort({ createdAt: -1 }).lean()

      if (!logs || logs.length === 0) {
        warn('⚠ No se encontraron registros de email logs')
        return []
      }

      secureLog(`📄 Total de logs encontrados: ${logs.length}`)
      return logs
    } catch (err) {
      logError('❌ Error en EmailLogService → getAllLogs:', err.message)
      throw new Error('Error al obtener los registros de logs de email')
    }
  }

  /* -------------------------------------------------------------
      📌 GET — obtener logs por email
  ------------------------------------------------------------- */
  async getLogsByEmail(email) {
    try {
      const normalizedEmail = this.normalizeEmail(email)
      log(`📥 EmailLogService → getLogsByEmail (${normalizedEmail})`)

      if (!normalizedEmail || !/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
        warn('⚠ Email inválido al solicitar logs')
        throw new Error('Debe proporcionar un email válido')
      }

      const logs = await EmailLogModel.find({ email: normalizedEmail })
        .sort({ createdAt: -1 })
        .lean()

      if (!logs || logs.length === 0) {
        warn(`⚠ No existen logs registrados para: ${normalizedEmail}`)
        return []
      }

      secureLog(`📄 Logs encontrados para ${normalizedEmail}: ${logs.length}`)
      return logs
    } catch (err) {
      logError('❌ Error en EmailLogService → getLogsByEmail:', err.message)
      throw new Error(`Error al obtener logs del email: ${email}`)
    }
  }

  /* -------------------------------------------------------------
      📌 GET FAILED — obtener logs fallidos (para reintentos)
  ------------------------------------------------------------- */
  async getFailedEmails() {
    try {
      log('📥 EmailLogService → getFailedEmails')

      const logs = await EmailLogModel.find({ status: 'failed' }).sort({ createdAt: -1 }).lean()

      secureLog(`📄 Emails fallidos encontrados: ${logs.length}`)

      return logs
    } catch (err) {
      logError('❌ Error en EmailLogService → getFailedEmails:', err.message)
      throw new Error('Error al obtener logs fallidos')
    }
  }
}

export default EmailLogService
