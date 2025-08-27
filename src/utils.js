import { fileURLToPath } from 'url'
import { dirname } from 'path'
import bcrypt from 'bcrypt'
import env from './config.js'
import jwt from 'jsonwebtoken'
/* import { faker } from '@faker-js/faker/locale/es_MX'
import nodemailer from 'nodemailer'
import swaggerJsdoc from 'swagger-jsdoc' */
import path from 'path'
import multer from 'multer'

export const createHash = (password) => bcrypt.hashSync(password, bcrypt.genSaltSync(10))
export const isValidPassword = (user, password) => {
  return bcrypt.compareSync(password, user.password)
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
/* 
export const cookieExtractor = (req) => {
    let token = null;
    if (req && req.cookies) {
        token = req.cookies['cookieToken'];
        return token
    }
    return token;
}; */

//config mocking de products

/* export const generateProduct = () => {
    const product = {
        title: faker.commerce.product(),
        price: faker.commerce.price(),
        category: faker.commerce.department(),
        stock: faker.number.int({ min: 1, max: 50 }),
        thumbnail: 'Sin Imagen'/* faker.image.url() ,
        _id: faker.database.mongodbObjectId(),
        code: faker.string.alphanumeric(5),
        description: faker.commerce.productDescription(),
    }    

    return product
}; */

//config nodemailer
/* export const generateTokenForEmail = (email) => {
    const token = jwt.sign({email}, `${PRIVATE_KEY}`, {expiresIn: '1h'})
    return token
}

const mailConfig = {
    service: env.mailingService,
    port: env.mailingPort,
    auth: {
        user: env.mailingUser,
        pass: env.mailingPass,
    },
    tls: {
        rejectUnauthorized: false
    }
} */

//export const transport = nodemailer.createTransport(mailConfig);

//configuracion swagger
/* const swaggerOptions ={
    definition:{
        openapi: '3.0.1',
        info: {
            title: 'Documentacion del poder y del saber',
            description: 'API pensada para clase de Swagger'
        }
    },
    apis:[`${__dirname}/docs/(**)/*.yaml`]eliminar parentesis
}

export const specs = swaggerJsdoc(swaggerOptions) */

//configuracion multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const urlData = 'htts://backaaa-production.up.railway.app'
    switch (req.body.role) {
      case 'alumno-1':
        cb(null, path.join(`${urlData}/data/uploads/alumnos/primero`))
        break
      case 'alumno-2':
        cb(null, path.join(`${urlData}/data/uploads/alumnos/segundo`))
        break
      default:
        cb(null, path.join(`${urlData}/data/uploads/alumnos/tercero`))
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
})
