// src/dao/managers/mongo/emailLog.mongo.js
import EmailLogModel from '../../models/emailLog.model.js'
import { log, error as logError, warn } from '../../../utils/logger.js'

class EmailLogManager {
  /* ---------------------------------------------------------
      📌 CREATE LOG
      - No rompe app si vienen datos incompletos
      - Normaliza email
      - Loguea exactamente qué falló
  --------------------------------------------------------- */
  async createLog(data) {
    try {
      log('📨 DAO → EmailLog.createLog')

      if (!data || typeof data !== 'object') {
        warn('⚠ EmailLogManager.createLog recibió datos inválidos')
        throw new Error('Datos de log inválidos')
      }

      // Normalizar email
      if (data.email) {
        data.email = String(data.email).trim().toLowerCase()
      }

      return await EmailLogModel.create(data)
    } catch (err) {
      logError('❌ Error DAO al crear EmailLog:', err.message)
      throw new Error('Error al guardar el log de email')
    }
  }
}

export default EmailLogManager
