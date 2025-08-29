import { fileURLToPath } from 'url'
import { dirname } from 'path'
import bcrypt from 'bcrypt'
import env from './config.js'
import jwt from 'jsonwebtoken'
import path from 'path'
import multer from 'multer'

export const createHash = (password) => bcrypt.hashSync(password, bcrypt.genSaltSync(10))
export const isValidPassword = (user, password) => {
  const result = bcrypt.compareSync(password, user.password)
  return result
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default __dirname

//configuracion JWT

export const PRIVATE_KEY = env.keyPrivate //luego exportar desde .env

export const generateToken = (user) => {
  const token = jwt.sign({ user }, `${PRIVATE_KEY}`, { expiresIn: '24h' })
  return token
}

//configuracion ruta mongo para gridfs
const USER_MONGO = env.userMongo
const PASS_MONGO = env.passMongo
const DB_CLUSTER = env.dbCluster
const DB_NAME = env.dbColecction
export const MONGO_URI = `mongodb+srv://${USER_MONGO}:${PASS_MONGO}@${DB_CLUSTER}/${DB_NAME}?retryWrites=true&w=majority`

//configuracion multer sin gridfs
/* const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    switch (req.body.role) {
      case 'alumno-1':
        cb(null, path.join(`${__dirname}/dao/uploads/alumnos/primero`))
        break
      case 'alumno-2':
        cb(null, path.join(`${__dirname}/dao/uploads/alumnos/segundo`))
        break
      default:
        cb(null, path.join(`${__dirname}/dao/uploads/alumnos/tercero`))
        break
    }
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`)
  }
})

export const uploader = multer({
  storage,
  onError: function (err, next) {
    console.log(err)
    next()
  }
}) */

//configuracion multer con gridfs
// Crear almacenamiento GridFS
/* const storage = new GridFsStorage({
  url: MONGO_URI,
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      const filename = `${Date.now()}-${file.originalname}`
      const fileInfo = {
        filename: filename,
        bucketName: 'studentFiles',
        metadata: {
          originalName: file.originalname,
          uploadDate: new Date(),
          role: req.body.role || 'tercero',
          contentType: file.mimetype,
          studentData: {
            name: req.body.name,
            email: req.body.email
          }
        }
      }
      resolve(fileInfo)
    })
  }
})

export const uploader = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // Límite de 10MB
  },
  fileFilter: (req, file, cb) => {
    // Validar tipos de archivo permitidos
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/
    const extension = file.originalname.toLowerCase()
    const extname = allowedTypes.test(extension)
    const mimetype = allowedTypes.test(file.mimetype)

    if (mimetype && extname) {
      return cb(null, true)
    } else {
      cb(new Error('Tipo de archivo no permitido. Solo se permiten imágenes, PDF y documentos.'))
    }
  },
  onError: function (err, next) {
    console.log('Error en upload:', err)
    next(err)
  }
}) */

// ↓↓↓ CONFIGURACIÓN MULTER SIMPLIFICADA ↓↓↓
export const uploader = multer({
  storage: multer.memoryStorage(), // Solo en memoria
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/
    const extname = allowedTypes.test(file.originalname.toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)

    if (mimetype && extname) {
      cb(null, true)
    } else {
      cb(new Error('Tipo de archivo no permitido'))
    }
  }
})
