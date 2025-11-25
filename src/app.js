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

// Inicializar app
const app = express()

// 🧱 Middlewares base
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

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

// 🗄️ Conexión MongoDB
mongoose
  .connect(env.mongo.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => log('✅ Conectado a MongoDB'))
  .catch((err) => logError('❌ Error MongoDB:', err.message))

// 📦 GridFS
let gfsBucket
app.use((req, res, next) => {
  if (!gfsBucket && mongoose.connection.readyState === 1) {
    gfsBucket = new GridFSBucket(mongoose.connection.db, { bucketName: 'studentFiles' })
    log('📁 GridFSBucket inicializado correctamente')
  }
  req.gfsBucket = gfsBucket
  next()
})

// 🚀 Rutas
app.use('/api/users', new UsersRouter().getRouter())
app.use('/api/sessions', new SessionsRouter().getRouter())
app.use('/api/students', new StudentRouter().getRouter())
app.use('/api/files', new FilesRouter().getRouter())
app.use('/api/inscriptions', new InscriptionsRouter().getRouter())
app.use('/api/email-logs', new EmailLogsRouter().getRouter())

// 📌 Mostrar las rutas cargadas
app.listen(env.port, () => {
  displayRoutes(app)
  log(`🚀 Servidor escuchando en puerto ${env.port}`)
})

// Manejador global de errores (REQUIRED PARA LOS TESTS)
app.use((err, req, res, next) => {
  const status = err.statusCode || 500

  return res.status(status).json({
    success: false,
    message: err.message || 'Error interno del servidor'
  })
})

// 404 para rutas no encontradas
app.use(notFoundHandler)

// 🟥 Middleware global de errores (SIEMPRE AL FINAL)
app.use(errorHandler)

export default app
