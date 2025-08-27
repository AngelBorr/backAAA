import express from 'express'
import cors from 'cors'
import displayRoutes from 'express-routemap'
import mongoose from 'mongoose'
import env from './config.js'
import UsersRouter from './routes/users.router.js'
//import ViewRouter from './routes/views.router.js'
//import handlerbars from 'express-handlebars'
import __dirname from './utils.js'
import SessionsRouter from './routes/sessions.router.js'
import initializePassport from './config/passport.config.js'
import passport from 'passport'
import session from 'express-session'
import MongoStore from 'connect-mongo'
import StudentRouter from './routes/student.router.js'

//routes
const usersRouter = new UsersRouter()
const sessionsRouter = new SessionsRouter()
const studentsRouter = new StudentRouter()
//const viewRouter = new ViewRouter()

//const data mongo
const PORT = 8080
const USER_MONGO = env.userMongo
const PASS_MONGO = env.passMongo
const DB_CLUSTER = env.dbCluster
const DB_NAME = env.dbColecction
const rutaMongo = `mongodb+srv://${USER_MONGO}:${PASS_MONGO}@${DB_CLUSTER}/${DB_NAME}?retryWrites=true&w=majority`
//const rutaMongo = `mongodb+srv://${USER_MONGO}:${PASS_MONGO}@cluster0.wd5qrnn.mongodb.net/`

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

//rutas
app.use('/api/users', usersRouter.getRouter())
app.use('/api/sessions', sessionsRouter.getRouter())
app.use('/api/students', studentsRouter.getRouter())

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
  .then(() => console.log('conectado a mongo'))
  .catch((err) => {
    console.log('app.js', err.message)
  })
