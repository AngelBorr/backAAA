// src/app.js
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import displayRoutes from 'express-routemap'
import mongoose from 'mongoose'
import env from './config.js'
import passport from 'passport'
import initializePassport from './config/passport.config.js'
import { GridFSBucket } from 'mongodb'

// Logger
import { log, error as logError } from './utils/logger.js'

// Middlewares
import httpLogger from './middlewares/httpLogger.js'
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js'

// Routers
import UsersRouter from './routes/users.router.js'
import SessionsRouter from './routes/sessions.router.js'
import StudentRouter from './routes/student.router.js'
import FilesRouter from './routes/files.router.js'
import InscriptionsRouter from './routes/inscriptions.router.js'
import EmailLogsRouter from './routes/emailLogs.router.js'
import DebugEmailRouter from './routes/debugEmail.router.js'
import SmtpTestRouter from './routes/smtpTest.router.js'

// ✔ Mailing Service (inyectable)
import MailingService from './services/service.mailing.js'
import { injectMailingService } from './services/service.inscription.js'

import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Inicializar app
const app = express()

// --------------------------------------------------------------
// ✔ Instanciar e inyectar MailingService (EVITA CICLOS)
// --------------------------------------------------------------
const mailingService = new MailingService()
injectMailingService(mailingService)
log('📧 MailingService inyectado correctamente')

// --------------------------------------------------------------
// Middlewares base
// --------------------------------------------------------------
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 🌐 Archivos estáticos
app.use('/public', express.static(path.join(__dirname, 'public')))

// 🌐 Logger HTTP (Morgan + Winston)
app.use(httpLogger)

// 🌐 Configuración CORS
app.use(
  cors({
    origin: ['https://asociacionargentinadearbitros.com.ar', 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
)

// 🔐 Passport
initializePassport()
app.use(passport.initialize())

// --------------------------------------------------------------
// 🗄️ Conexión MongoDB
// --------------------------------------------------------------
mongoose
  .connect(env.mongo.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => log('✅ Conectado a MongoDB'))
  .catch((err) => logError('❌ Error MongoDB:', err.message))

// --------------------------------------------------------------
// 📦 GridFS
// --------------------------------------------------------------
let gfsBucket
app.use((req, res, next) => {
  if (!gfsBucket && mongoose.connection.readyState === 1) {
    gfsBucket = new GridFSBucket(mongoose.connection.db, { bucketName: 'studentFiles' })
    log('📁 GridFSBucket inicializado correctamente')
  }
  req.gfsBucket = gfsBucket
  next()
})

// --------------------------------------------------------------
// 🚀 Rutas
// --------------------------------------------------------------
app.use('/api/users', new UsersRouter().getRouter())
app.use('/api/sessions', new SessionsRouter().getRouter())
app.use('/api/students', new StudentRouter().getRouter())
app.use('/api/files', new FilesRouter().getRouter())
app.use('/api/inscriptions', new InscriptionsRouter().getRouter())
app.use('/api/email-logs', new EmailLogsRouter().getRouter())
app.use('/api/debug-email', new DebugEmailRouter().getRouter())
app.use('/api/smtp-test', new SmtpTestRouter().getRouter())

// --------------------------------------------------------------
// 📌 Mostrar rutas cargadas
// --------------------------------------------------------------
app.listen(env.port, () => {
  displayRoutes(app)
  log(`🚀 Servidor escuchando en puerto ${env.port}`)
})

// --------------------------------------------------------------
// 🟥 Manejadores de errores
// --------------------------------------------------------------
app.use((err, req, res, next) => {
  const status = err.statusCode || 500

  return res.status(status).json({
    success: false,
    message: err.message || 'Error interno del servidor'
  })
})

// 404 para rutas no encontradas
app.use(notFoundHandler)

// 🟥 Middleware global de errores
app.use(errorHandler)

export default app
