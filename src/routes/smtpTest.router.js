// src/routes/smtpTest.router.js
import MyOwnRouter from './router.js'
import nodemailer from 'nodemailer'
import env from '../config.js'
import { log, error as logError } from '../utils/logger.js'

export default class SmtpTestRouter extends MyOwnRouter {
  init() {
    this.get('/check', ['PUBLIC'], async (req, res) => {
      try {
        log('📡 Probando conexión SMTP…')

        const transporter = nodemailer.createTransport({
          host: env.email.host,
          port: env.email.port,
          secure: false,
          auth: {
            user: env.email.user,
            pass: env.email.pass
          },
          tls: {
            rejectUnauthorized: false
          }
        })

        // 🔍 test de conexión
        const result = await transporter.verify()

        return res.status(200).json({
          success: true,
          message: 'SMTP conectado correctamente',
          result
        })
      } catch (err) {
        logError('❌ Error probando SMTP:', err)

        return res.status(500).json({
          success: false,
          message: err.message,
          stack: err.stack
        })
      }
    })
  }
}
