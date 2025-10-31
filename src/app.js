import express from 'express'
import cors from 'cors'
import displayRoutes from 'express-routemap'
import mongoose from 'mongoose'
import env from './config.js'
import UsersRouter from './routes/users.router.js'
import SessionsRouter from './routes/sessions.router.js'
import initializePassport from './config/passport.config.js'
import passport from 'passport'
import session from 'express-session'
import MongoStore from 'connect-mongo'
import StudentRouter from './routes/student.router.js'
import { GridFSBucket } from 'mongodb'
import FilesRouter from './routes/files.router.js'
import { MONGO_URI } from './utils.js'
import InscriptionsRouter from './routes/inscriptions.router.js'

//routes
const usersRouter = new UsersRouter()
const sessionsRouter = new SessionsRouter()
const studentsRouter = new StudentRouter()
const filesRouter = new FilesRouter()
const inscriptionsRouter = new InscriptionsRouter()

//port
const PORT = 8080

//ruta mongo atlas
const rutaMongo = MONGO_URI

//data session
const secret = env.secret

const app = express()
app.use(cors())

//config express
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

//configuracion Session
app.use(
  session({
    store: new MongoStore({
      mongoUrl: rutaMongo,
      ttl: 3600
    }),
    secret: `${secret}`,
    resave: false,
    saveUninitialized: false
  })
)

//configuracion passport
initializePassport()
app.use(passport.initialize())
app.use(passport.session())

// ↓↓↓ CONFIGURACIÓN GRIDFS BUCKET GLOBAL ↓↓↓
let gfsBucket

app.use((req, res, next) => {
  try {
    if (!gfsBucket && mongoose.connection.readyState === 1) {
      gfsBucket = new GridFSBucket(mongoose.connection.db, {
        bucketName: 'studentFiles'
      })
      console.log('GridFSBucket inicializado correctamente')
    }
    req.gfsBucket = gfsBucket

    next()
  } catch (error) {
    console.error('Error inicializando GridFSBucket:', error)
    next(error)
  }
})

// ↓↓↓ Middleware adicional para verificar conexión async (opcional) ↓↓↓
app.use(async (req, res, next) => {
  // Si el bucket no está inicializado pero MongoDB está conectado, inicializarlo
  if (!req.gfsBucket && mongoose.connection.readyState === 1) {
    try {
      gfsBucket = new GridFSBucket(mongoose.connection.db, {
        bucketName: 'studentFiles'
      })
      req.gfsBucket = gfsBucket
      console.log('GridFSBucket inicializado en middleware async')
    } catch (error) {
      console.error('Error inicializando GridFSBucket en async:', error)
    }
  }
  next()
})

//rutas
app.use('/api/users', usersRouter.getRouter())
app.use('/api/sessions', sessionsRouter.getRouter())
app.use('/api/students', studentsRouter.getRouter())
app.use('/api/files', filesRouter.getRouter())
app.use('/api/inscriptions', inscriptionsRouter.getRouter())

//server en puerto 8080
const httpServer = app.listen(`${PORT}`, () => {
  displayRoutes(app)
  console.log('servidor escuchando en el puerto 8080')
})

//conection a mongoose server
mongoose
  .connect(rutaMongo, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(async () => {
    console.log('conectado a mongo')
  })
  .catch((err) => {
    console.log('app.js', err.message)
  })

export default app
