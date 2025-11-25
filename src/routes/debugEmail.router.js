// src/routes/debugEmail.router.js
import MyOwnRouter from './router.js'
import MailingService from '../services/service.mailing.js'
import { injectMailingService } from '../services/service.inscription.js'
import env from '../config.js'
import { log, error as logError } from '../utils/logger.js'

/**
 * ⛔ IMPORTANTE:
 * NO se inyecta aquí el MailingService.
 * La inyección REAL se hace en app.js para evitar duplicaciones.
 */

export default class DebugEmailRouter extends MyOwnRouter {
  init() {
    // Endpoint seguro para pruebas de envío de mail
    this.get(
      '/send-test',
      ['PUBLIC'], // o ['ADMIN']
      async (req, res) => {
        try {
          const { email, secret } = req.query

          // 🔐 Proteger acceso
          if (secret !== env.debugMailSecret) {
            logError('❌ Intento de uso sin secret válido')
            return res.status(401).json({
              success: false,
              message: 'UNAUTHORIZED – Secret inválido'
            })
          }

          if (!email) {
            return res.status(400).json({
              success: false,
              message: 'Debe enviar el parámetro email'
            })
          }

          log(`📧 ENVIANDO EMAIL DE PRUEBA A: ${email}`)

          // Usar la MISMA instancia global inyectada en app.js
          const mailingService = new MailingService()
          injectMailingService(mailingService)

          const result = await mailingService.createEmailValidationIncription(email)

          return res.status(200).json({
            success: true,
            message: 'Email de prueba enviado correctamente',
            smtp: result
          })
        } catch (err) {
          logError('❌ Error en /debug-email/send-test:', err)
          return res.status(500).json({
            success: false,
            message: err.message
          })
        }
      }
    )
  }
}
