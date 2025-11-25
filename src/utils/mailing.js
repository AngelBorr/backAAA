// src/utils/mailing.js
import nodemailer from 'nodemailer'
import env from '../config.js'

// 🚀 SMTP CONFIG CORRECTA PARA CPANEL
// Evita ECONNREFUSED ::1:587 usando host/puerto reales de producción
const emailConfig = {
  host: env.email.host, // mail.asociacionargentinadearbitros.com.ar
  port: Number(env.email.port), // 26 (cPanel SMTP alternativo)
  secure: false, // puerto 26 -> NO usa SSL
  auth: {
    user: env.email.user,
    pass: env.email.pass
  },
  tls: {
    // cPanel → requiere esto o rechaza certificados
    rejectUnauthorized: false
  }
}

// transport listo para usar globalmente
export const transport = nodemailer.createTransport(emailConfig)

// DEBUG opcional: imprime configuración en desarrollo
if (env.nodeEnv !== 'production') {
  console.log('📧 Nodemailer transport inicializado:', emailConfig)
}
