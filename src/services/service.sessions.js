import jwt from 'jsonwebtoken'
import env from '../config.js'
import UsersService from './service.users.js'

const usersService = new UsersService()

class SessionsService {
  async generateAuthResponse(user, res) {
    try {
      const safeUser = {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }

      const token = jwt.sign({ user: safeUser }, env.jwt.privateKey, {
        expiresIn: env.jwt.expiresIn // ✅ usa JWT_PRIVATE_KEY
      })

      res.cookie(env.cookie.name, token, {
        httpOnly: true,
        sameSite: env.cookie.sameSite,
        secure: env.cookie.secure,
        maxAge: env.cookie.maxAge
      })

      return { status: 200, message: 'Usuario autenticado correctamente' }
    } catch (error) {
      console.error('SessionsService.generateAuthResponse error:', error)
      return { status: 500, message: 'Error al generar el token de autenticación' }
    }
  }

  async getCurrentUser(user) {
    try {
      if (!user?.email) return { status: 400, message: 'Token inválido o corrupto' }

      const dbUser = await usersService.getUser(user.email)
      if (!dbUser) return { status: 404, message: 'Usuario no encontrado' }

      return {
        status: 200,
        message: 'Usuario autenticado correctamente',
        user: {
          id: dbUser._id,
          firstName: dbUser.firstName,
          lastName: dbUser.lastName,
          email: dbUser.email,
          role: dbUser.role
        }
      }
    } catch (error) {
      console.error('SessionsService.getCurrentUser error:', error)
      return { status: 500, message: 'Error al obtener datos del usuario' }
    }
  }

  async logoutUser(user) {
    try {
      if (!user?.email) return { status: 400, message: 'Usuario inválido o no autenticado' }
      return { status: 200, message: `Logout exitoso para ${user.email}` }
    } catch (error) {
      console.error('SessionsService.logoutUser error:', error)
      return { status: 500, message: 'Error al cerrar sesión' }
    }
  }
}

export default SessionsService
