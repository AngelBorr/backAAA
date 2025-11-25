// src/services/service.mailing.js
import { transport } from '../utils/mailing.js'
import env from '../config.js'
import UsersInscriptionService from './service.inscription.js'
import EmailLogService from './emailLog.service.js'
import { log, error as logError, secureLog } from '../utils/logger.js'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

class MailingService {
  /* ============================================================
      📌 MAILING INDIVIDUAL
  ============================================================ */
  async createEmailValidationIncription(email) {
    log(`📧 MailingService → Enviando email de validación a ${email}`)

    // Instancias locales → evita ciclo
    const usersInscriptionService = new UsersInscriptionService()
    const emailLogService = new EmailLogService()

    try {
      const user = await usersInscriptionService.getUserInscription(email)
      if (!user) throw new Error('No se encontró un usuario con ese email')

      const pdfPath = path.join(__dirname, '../../public/docs/Confirmacion-2026.pdf')

      const html = `
        <div style="
          max-width: 600px;
          margin: auto;
          border: 3px solid #1282a2;
          padding: 20px;
          font-family: Arial;
          text-align: center;
        ">
          <img src="cid:logoAAA" alt="AAA" width="180" style="margin-bottom: 20px;" />

          <h2 style="color:#1282a2;">Inscripción Confirmada</h2>

          <p>Hola <b>${user.name} ${user.lastName}</b>,</p>
          <p>Tu inscripción a la Escuela de Árbitros AAA (curso 2026) fue recibida correctamente.</p>

          <p>Adjuntamos un archivo PDF con toda la información necesaria.</p>

          <p style="margin-top:20px;">Saludos cordiales,<br>Asociación Argentina de Árbitros</p>
        </div>
      `

      const mailConfig = {
        from: `Asociación Argentina de Árbitros <${env.email.user}>`,
        to: email,
        subject: 'Inscripción confirmada - Escuela AAA 2026',
        html,
        attachments: [
          {
            filename: 'Confirmacion-2026.pdf',
            path: pdfPath
          },
          {
            filename: 'logo-aaa.png',
            path: path.join(__dirname, '../../public/img/logo-aaa.png'),
            cid: 'logoAAA'
          }
        ]
      }

      secureLog('📤 Email payload:', mailConfig)

      const sent = await transport.sendMail(mailConfig)
      log('✅ Email enviado correctamente')

      await emailLogService.addLog({
        userId: user._id,
        email,
        type: 'inscription_validation',
        status: 'success',
        payload: mailConfig
      })

      return sent
    } catch (err) {
      logError('❌ Error en MailingService:', err.message)

      const emailLogService = new EmailLogService()
      await emailLogService.addLog({
        userId: null,
        email,
        type: 'inscription_validation',
        status: 'failed',
        errorMessage: err.message
      })

      throw new Error(`Error al enviar email de validación: ${err.message}`)
    }
  }

  /* ============================================================
      📌 ENVÍO MASIVO
  ============================================================ */
  async sendValidationEmailToAll(usersArray) {
    log(`📧 Enviando emails de validación a ${usersArray.length} usuarios...`)

    const results = []

    for (const user of usersArray) {
      try {
        log(`📨 Enviando email a: ${user.email}`)
        await this.createEmailValidationIncription(user.email)

        results.push({ email: user.email, status: 'success' })

        await new Promise((res) => setTimeout(res, 500)) // pequeño delay
      } catch (err) {
        logError(`❌ Error enviando email a ${user.email}:`, err.message)

        results.push({
          email: user.email,
          status: 'failed',
          error: err.message
        })
      }
    }

    log('✔ Finalizado envío masivo')
    return results
  }

  /* ============================================================
      📌 REENVÍO DE EMAILS FALLIDOS
  ============================================================ */
  async resendFailedEmails() {
    log('🔄 Buscando emails fallidos para reenviar...')

    const emailLogService = new EmailLogService()
    const failedLogs = await emailLogService.getFailedEmails()

    if (failedLogs.length === 0) {
      log('✔ No hay emails fallidos para reenviar')
      return []
    }

    log(`📧 Se encontraron ${failedLogs.length} emails fallidos.`)

    const results = []

    for (const logItem of failedLogs) {
      try {
        log(`🔄 Reintentando enviar email a ${logItem.email}`)

        await this.createEmailValidationIncription(logItem.email)

        await emailLogService.addLog({
          userId: logItem.userId,
          email: logItem.email,
          type: logItem.type,
          status: 'success',
          payload: { retry: true }
        })

        results.push({ email: logItem.email, status: 'resent-success' })
      } catch (err) {
        logError(`❌ Error reintentando email a ${logItem.email}:`, err.message)

        await emailLogService.addLog({
          userId: logItem.userId,
          email: logItem.email,
          type: logItem.type,
          status: 'failed',
          errorMessage: err.message
        })

        results.push({ email: logItem.email, status: 'resent-failed', error: err.message })
      }
    }

    log('✔ Reenvío de emails fallidos finalizado')
    return results
  }
}

export default MailingService
