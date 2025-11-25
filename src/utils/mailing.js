/* import nodemailer from 'nodemailer'
import env from '../config.js'

const emailConfig = env.email.service
  ? {
      service: env.email.service,
      auth: {
        user: env.email.user,
        pass: env.email.pass
      }
    }
  : {
      host: env.email.host,
      port: env.email.port,
      secure: env.email.port === 465, // SSL ports
      auth: {
        user: env.email.user,
        pass: env.email.pass
      }
    }

export const transport = nodemailer.createTransport(emailConfig)
 */

import nodemailer from 'nodemailer'
import { env } from '../config.js'

export const transport = nodemailer.createTransport({
  host: env.email.host,
  port: env.email.port,
  secure: false, // SMTP 26 = NO SSL
  auth: {
    user: env.email.user,
    pass: env.email.pass
  },
  tls: {
    rejectUnauthorized: false
  }
})
