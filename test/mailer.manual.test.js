// test/mailer.manual.test.js
import 'dotenv/config'
import mongoose from 'mongoose'
import MailingService from '../src/services/service.mailing.js'
import EmailLogService from '../src/services/emailLog.service.js'
import env from '../config.js'
import { log, error as logError } from '../src/utils/logger.js'

// ---------------------------------------------
// 📌 CONFIG DE PRUEBA MANUAL
// ---------------------------------------------
const TEST_USER_ID = '691e9c24354dec383e321e18'
const TEST_EMAIL = 'angelborre@gmail.com'

// ---------------------------------------------
// 📌 FUNCIÓN PRINCIPAL
// ---------------------------------------------
async function main() {
  try {
    log('🔌 Conectando a MongoDB...')
    await mongoose.connect(env.mongo.url)

    log('📨 Inicializando servicios...')
    const mailingService = new MailingService()
    const emailLogService = new EmailLogService()

    log(`📧 Enviando email manual a: ${TEST_EMAIL}`)

    // ---- Envío real ----
    const result = await mailingService.createEmailValidationIncription(TEST_EMAIL)

    log('✅ Email enviado exitosamente. Resultado SMTP completo:')
    console.log(result)

    // ---- Log con el userId del test ----
    await emailLogService.addLog({
      userId: TEST_USER_ID,
      email: TEST_EMAIL,
      type: 'manual_test',
      status: 'success',
      payload: { manual: true }
    })

    log('📁 Log guardado correctamente en la colección emailLogs')

    process.exit(0)
  } catch (err) {
    logError('❌ Error ejecutando el envío manual:', err.message)
    process.exit(1)
  }
}

// Ejecutar script
main()
