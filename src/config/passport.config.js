import passport from 'passport'
import local from 'passport-local'
/* import {
  PRIVATE_KEY,
  cookieExtractor,
  createHash,
  generateToken,
  isValidPassword
} from '../utils.js' */
import { createHash, generateToken, isValidPassword } from '../utils.js'
import UsersService from '../services/service.users.js'

//import env from '../config.js'

import jwt from 'passport-jwt'

// import UserDTO from '../dto/user.dto.js'

const usersService = new UsersService()
const LocalStrategy = local.Strategy

const JWTStrategy = jwt.Strategy
const ExtractJWT = jwt.ExtractJwt

const initializePassport = () => {
  /* passport.use(
    'current',
    new JWTStrategy(
      {
        jwtFromRequest: ExtractJWT.fromExtractors([cookieExtractor]),
        secretOrKey: PRIVATE_KEY
      },
      async (jwt_payload, done) => {
        try {
          return done(null, jwt_payload)
        } catch (error) {
          done(error)
        }
      }
    )
  ) */

  passport.use(
    'register',
    new LocalStrategy(
      {
        passReqToCallback: true,
        usernameField: 'email'
      },
      async (req, username, password, done) => {
        const { firstName, lastName, email, role } = req.body
        try {
          const existingUser = await usersService.getUser(username)
          if (existingUser !== typeof Object) {
            const user = {
              firstName,
              lastName,
              email,
              password: createHash(password),
              role
            }
            const newUser = await usersService.registerUser(user)
            if (newUser) {
              return done(null, newUser)
            } else {
              return done({
                message: 'Se produjo un error al crear el nuevo usuario: ' + error.message
              })
            }
          } else {
            return done(null, false)
          }
        } catch (error) {
          return done({
            message:
              'Se produjo un error al obtener los datos para crear un nuevo usuario: ' +
              error.message
          })
        }
      }
    )
  )

  /* passport.use(
    'login',
    new LocalStrategy({ usernameField: 'email' }, async (username, password, done) => {
      try {
        //no incorpora el roll
        const user = await usersService.getUsers(username)
        if (!user) {
          return done(null, false, { message: 'Usuario incorrectos y/o inexistente' })
        }

        if (!isValidPassword(user, password)) {
          return done(null, false, {
            message: 'Contraseña incorrecta, verifique los datos ingresados'
          })
        }
        const userNoPass = new UserDTO(user)
        const token = generateToken(userNoPass)
        return done(null, user, token)
      } catch (error) {
        return done({ message: 'Error al Logearse' })
      }
    })
  )

  passport.serializeUser((user, done) => {
    done(null, user._id)
  })

  passport.deserializeUser(async (_id, done) => {
    try {
      const user = await usersService.getUserById(_id)
      return done(null, user)
    } catch {
      return done({ message: 'Se produjo un error al deserializa el usuario' })
    }
  })
} */

  passport.use(
    'login',
    new LocalStrategy(
      { usernameField: 'email', passwordField: 'password', session: false },
      async (email, password, done) => {
        try {
          const normalizedEmail = String(email || '')
            .trim()
            .toLowerCase()
          if (!normalizedEmail || !password) {
            return done(null, false, { message: 'Email y contraseña son obligatorios' })
          }

          // Debe devolver un usuario por email. Mantengo el nombre original de tu servicio.
          const user = await usersService.getUser(normalizedEmail)
          if (!user) {
            return done(null, false, { message: 'Usuario inexistente o credenciales inválidas' })
          }

          const valid = isValidPassword(user, password)
          if (!valid) {
            return done(null, false, { message: 'Contraseña incorrecta' })
          }

          // Éxito: passport pondrá user en req.user
          return done(null, user)
        } catch (err) {
          return done(err) // Error del sistema mejorar mensaje
        }
      }
    )
  )

  // Como NO usamos sesiones, serialize/deserialize no son necesarios;
  // pero si quedan otros flujos que lo usen, los dejamos no-op:
  passport.serializeUser((user, done) => done(null, user._id))
  passport.deserializeUser(async (_id, done) => done(null, { _id }))
}

export default initializePassport
