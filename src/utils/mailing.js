import nodemailer from 'nodemailer'
import env from '../config.js'

const emailConfig = {
  host: env.email.host, // mail.asociacionargentinadearbitros.com.ar
  port: Number(env.email.port), // 26
  secure: false, // puerto 26 NO usa SSL
  auth: {
    user: env.email.user,
    pass: env.email.pass
  },
  tls: {
    rejectUnauthorized: false // requerido por CPanel
  }
}

export const transport = nodemailer.createTransport(emailConfig)
