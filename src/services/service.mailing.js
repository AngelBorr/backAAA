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

      /* =======================
         PDF → Base64
      ======================= */
      const pdfPath = path.join(__dirname, '../../public/docs/Confirmacion-2026.pdf')
      const pdfBuffer = fs.readFileSync(pdfPath)
      const pdfBase64 = pdfBuffer.toString('base64')

      /* =======================
         LOGO → Base64 INLINE
         (para que SIEMPRE cargue)
      ======================= */
      const logoImgPath = path.join(__dirname, '../../public/img/logo-aaa.png')
      const logoBuffer = fs.readFileSync(logoImgPath)
      const logoBase64 = logoBuffer.toString('base64')
      const logoDataUri = `data:image/png;base64,${logoBase64}`

      /* =======================
         HTML RESPONSIVE
      ======================= */
      const html = `
      <div style="max-width:600px;margin:auto;border:1px solid #e2e2e2;border-radius:8px;padding:20px;font-family:Arial,Helvetica,sans-serif;">
        
        <div style="text-align:center;margin-bottom:20px;">
          <img src="${logoDataUri}" alt="AAA" width="150" style="max-width:100%;height:auto;" />
        </div>

        <h2 style="color:#1282a2;text-align:center;margin-bottom:10px;">
          Inscripción Confirmada
        </h2>

        <p style="font-size:16px;color:#333;line-height:1.5;">
          Hola <b>${user.name} ${user.lastName}</b>,
        </p>

        <p style="font-size:15px;color:#555;line-height:1.6;">
          Tu inscripción a la Escuela de Árbitros AAA (curso 2026) fue recibida correctamente.
          Adjuntamos un archivo PDF con toda la información necesaria.
        </p>

        <!-- CTA RESPONSIVE -->
        <div style="text-align:center;margin-top:25px;">
          <a href="https://asociacionargentinadearbitros.com.ar" 
             style="background:#1282a2;color:white;padding:12px 22px;border-radius:6px;text-decoration:none;font-weight:bold;display:inline-block;">
             Visitar sitio AAA
          </a>
        </div>

        <p style="font-size:14px;color:#777;text-align:center;margin-top:30px;">
          Asociación Argentina de Árbitros – Escuela AAA
        </p>
      </div>

      <!-- Mobile-friendly spacing -->
      <div style="height:20px"></div>
      `

      /* =======================
         RESEND PAYLOAD
      ======================= */
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
