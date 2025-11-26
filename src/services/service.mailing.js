// src/services/service.mailing.js
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import env from '../config.js'
import UsersInscriptionService from './service.inscription.js'
import EmailLogService from './emailLog.service.js'
import { log, error as logError, secureLog } from '../utils/logger.js'
import { sendResendEmail } from '../utils/resend.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

class MailingService {
  /* ============================================================
      📌 RESEND → ENVÍO EMAIL INSCRIPCIÓN
  ============================================================ */
  async createEmailValidationIncription(email) {
    log(`📧 Resend → Enviando email de validación a ${email}`)

    const usersInscriptionService = new UsersInscriptionService()
    const emailLogService = new EmailLogService()

    try {
      const user = await usersInscriptionService.getUserInscription(email)
      if (!user) throw new Error('No se encontró un usuario con ese email')

      // Ruta PDF
      const pdfPath = path.join(__dirname, '../../public/docs/Confirmacion-2026.pdf')
      const pdfBuffer = fs.readFileSync(pdfPath)
      const pdfBase64 = pdfBuffer.toString('base64')

      // URL pública del logo (no CID)
      const logoUrl = 'https://asociacionargentinadearbitros.com.ar/img/logos/logo-aaa.png'

      const html = `
        <div style="
          max-width: 600px;
          margin: auto;
          border: 3px solid #1282a2;
          padding: 20px;
          font-family: Arial;
          text-align: center;
        ">
          <img src="${logoUrl}" alt="AAA" width="180" style="margin-bottom: 20px;" />

          <h2 style="color:#1282a2;">Inscripción Confirmada</h2>

          <p>Hola <b>${user.name} ${user.lastName}</b>,</p>
          <p>Tu inscripción a la Escuela de Árbitros AAA (curso 2026) fue recibida correctamente.</p>

          <p>Adjuntamos un archivo PDF con toda la información necesaria.</p>

          <p style="margin-top:20px;">Saludos cordiales,<br>Asociación Argentina de Árbitros</p>
        </div>
      `

      const payload = {
        from: env.resend.from,
        to: email,
        subject: 'Inscripción confirmada - Escuela AAA 2026',
        html,
        attachments: [
          {
            filename: 'Confirmacion-2026.pdf',
            content: pdfBase64
          }
        ]
      }

      secureLog('📤 Resend payload:', payload)

      const sent = await sendResendEmail(payload)

      log('✅ Email enviado correctamente con Resend')

      await emailLogService.addLog({
        userId: user._id,
        email,
        type: 'inscription_validation',
        status: 'success',
        payload
      })

      return sent
    } catch (err) {
      logError('❌ Error en MailingService (Resend):', err.message)

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
}

export default MailingService
