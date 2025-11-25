import EmailLogModel from '../../models/emailLog.model.js'
import { log, error as logError } from '../../../utils/logger.js'

class EmailLogManager {
  async createLog(data) {
    try {
      log('📨 DAO → EmailLog.createLog')
      return await EmailLogModel.create(data)
    } catch (err) {
      logError('❌ Error DAO al crear EmailLog:', err)
      throw new Error('Error al guardar el log de email')
    }
  }
}

export default EmailLogManager
