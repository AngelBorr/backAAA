import passport from 'passport'
import local from 'passport-local'
import jwt from 'passport-jwt'
import env from '../config.js'
import UsersService from '../services/service.users.js'
import { isValidPassword } from '../utils.js'

const usersService = new UsersService()
const LocalStrategy = local.Strategy
const JWTStrategy = jwt.Strategy
const ExtractJWT = jwt.ExtractJwt

const initializePassport = () => {
  // 🔐 Local login (valida credenciales)
  passport.use(
    'login',
    new LocalStrategy(
      { usernameField: 'email', passwordField: 'password', session: false },
      async (email, password, done) => {
        try {
          const normalized = String(email || '')
            .trim()
            .toLowerCase()
          if (!normalized || !password)
            return done(null, false, { message: 'Email y contraseña son obligatorios' })

          const user = await usersService.getUser(normalized)
          if (!user) return done(null, false, { message: 'Usuario inexistente' })

          if (!isValidPassword(user, password))
            return done(null, false, { message: 'Contraseña incorrecta' })

          return done(null, user)
        } catch (err) {
          return done(err)
        }
      }
    )
  )

  // 🟣 JWT (opcional; por si quieres usar passport-jwt en alguna ruta)
  passport.use(
    'jwt',
    new JWTStrategy(
      {
        jwtFromRequest: ExtractJWT.fromExtractors([
          (req) => req?.cookies?.[env.cookie.name] || null
        ]),
        secretOrKey: env.jwt.privateKey // ✅ usa JWT_PRIVATE_KEY
      },
      async (payload, done) => {
        try {
          if (!payload?.user) return done(null, false)
          return done(null, payload.user)
        } catch (err) {
          return done(err)
        }
      }
    )
  )

  passport.serializeUser((user, done) => done(null, user._id))
  passport.deserializeUser(async (_id, done) => done(null, { _id }))
}

export default initializePassport
