// src/routes/emailLogs.router.js
import MyOwnRouter from './router.js'
import { getAllEmailLogs, getEmailLogsByEmail } from '../controllers/controller.emailLog.js'

export default class EmailLogsRouter extends MyOwnRouter {
  init() {
    // Traer todos los logs (ADMIN)
    this.get('/', ['ADMIN'], getAllEmailLogs)

    // Traer logs por email (ADMIN)
    this.get('/:email', ['ADMIN'], getEmailLogsByEmail)
  }
}
