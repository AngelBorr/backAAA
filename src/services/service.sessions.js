import jwt from 'jsonwebtoken'
import env from '../config.js'
import UsersService from '../services/service.users.js'

const usersService = new UsersService()

class SessionsService {
  /**
   * Genera token JWT, setea cookie httpOnly y retorna respuesta uniforme.
   */
  async generateAuthResponse(user, res) {
    try {
      const payload = {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }

      const token = jwt.sign({ user: payload }, env.jwt.privateKey, {
        expiresIn: env.jwt.expiresIn
      })

      // ✅ Establecer cookie HttpOnly (fallback seguro)
      res.cookie(env.cookie.name, token, {
        httpOnly: true,
        secure: env.cookie.secure, // true en producción
        sameSite: env.cookie.sameSite, // "lax" recomendado
        maxAge: env.cookie.maxAge
      })

      return {
        status: 200,
        message: 'Usuario autenticado correctamente'
      }
    } catch (error) {
      console.error('SessionsService.generateAuthResponse error:', error)
      return {
        status: 500,
        message: 'Error al generar el token de autenticación'
      }
    }
  }

  async getCurrentUser(user) {
    try {
      if (!user?.email) {
        return { status: 400, message: 'Datos de usuario inválidos en el token' }
      }

      const dbUser = await usersService.getUser(user.email)
      if (!dbUser) {
        return { status: 404, message: 'Usuario no encontrado' }
      }

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
      if (!user?.email) {
        return { status: 400, message: 'Usuario inválido o no autenticado' }
      }

      return {
        status: 200,
        message: `Logout exitoso para ${user.email}`
      }
    } catch (error) {
      console.error('SessionsService.logoutUser error:', error)
      return { status: 500, message: 'Error al cerrar sesión' }
    }
  }
}

export default SessionsService
