import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import displayRoutes from 'express-routemap'
import mongoose from 'mongoose'
import env from './config.js'
import passport from 'passport'
import initializePassport from './config/passport.config.js'
import { GridFSBucket } from 'mongodb'

// Routers
import UsersRouter from './routes/users.router.js'
import SessionsRouter from './routes/sessions.router.js'
import StudentRouter from './routes/student.router.js'
import FilesRouter from './routes/files.router.js'
import InscriptionsRouter from './routes/inscriptions.router.js'

// Inicializar app
const app = express()

// 🧱 Middlewares base
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 🌐 Configuración CORS
app.use(
  cors({
    origin: [
      'https://asociacionargentinadearbitros.com.ar',
      'http://localhost:3000' // si probás local
    ],
    credentials: true, // ✅ Permite cookies cross-site
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
  .then(() => console.log('✅ Conectado a MongoDB'))
  .catch((err) => console.error('❌ Error MongoDB:', err.message))

// 📦 GridFS
let gfsBucket
app.use((req, res, next) => {
  if (!gfsBucket && mongoose.connection.readyState === 1) {
    gfsBucket = new GridFSBucket(mongoose.connection.db, { bucketName: 'studentFiles' })
    console.log('GridFSBucket inicializado correctamente')
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

// 🧭 Servidor
app.listen(env.port, () => {
  displayRoutes(app)
  console.log(`Servidor escuchando en puerto ${env.port}`)
})

export default app
