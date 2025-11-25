// src/routes/debugEmail.router.js
import MyOwnRouter from './router.js'
import { injectMailingService } from '../services/service.inscription.js'
import MailingService from '../services/service.mailing.js'
import env from '../config.js'
import { log, error as logError } from '../utils/logger.js'

const mailingService = new MailingService()
injectMailingService(mailingService)

export default class DebugEmailRouter extends MyOwnRouter {
  init() {
    // ⛔ Se recomienda proteger esto con un SECRET
    this.get(
      '/send-test',
      ['PUBLIC'], // podés cambiarlo por ADMIN si preferís
      async (req, res) => {
        try {
          const { email, secret } = req.query

          // Protegido: evita que cualquiera lo use si cae la URL
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
