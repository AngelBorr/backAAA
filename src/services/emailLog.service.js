import EmailLogManager from '../dao/managers/mongo/emailLog.mongo.js'
import { log, warn, error as logError } from '../utils/logger.js'

class EmailLogService {
  constructor() {
    this.emailLogDAO = new EmailLogManager()
  }
  /* ----------------------------------------
        📌 ADD — agregar un nuevo log
    ---------------------------------------- */

  async addLog({ userId, email, type, status, errorMessage = null, payload = null }) {
    try {
      log(`📨 EmailLogService → guardando log (${status}) para ${email}`)

      return await this.emailLogDAO.createLog({
        userId,
        email,
        type,
        status,
        errorMessage,
        payload
      })
    } catch (err) {
      logError('❌ Error EmailLogService.addLog:', err)
      // NO relanza → los logs NO deben romper el flujo principal
      return null
    }
  }

  /* ----------------------------------------
     📌 GET — obtener todos los logs
  ---------------------------------------- */
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
      logError('❌ Error en EmailLogService → getAllLogs:', err)
      throw new Error('Error al obtener los registros de logs de email')
    }
  }

  /* ----------------------------------------
     📌 GET — obtener logs por email
  ---------------------------------------- */
  async getLogsByEmail(email) {
    try {
      log(`📥 EmailLogService → getLogsByEmail (${email})`)

      if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
        warn('⚠ Email inválido al solicitar logs')
        throw new Error('Debe proporcionar un email válido')
      }

      const logs = await EmailLogModel.find({ email }).sort({ createdAt: -1 }).lean()

      if (!logs || logs.length === 0) {
        warn(`⚠ No existen logs registrados para: ${email}`)
        return []
      }

      secureLog(`📄 Logs encontrados para ${email}: ${logs.length}`)
      return logs
    } catch (err) {
      logError('❌ Error en EmailLogService → getLogsByEmail:', err)
      throw new Error(`Error al obtener logs del email: ${email}`)
    }
  }
}

export default EmailLogService
