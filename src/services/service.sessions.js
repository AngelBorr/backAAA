import jwt from 'jsonwebtoken'
import env from '../config.js'
import UsersService from '../services/service.users.js'

const usersService = new UsersService()

class SessionsService {
  /**
   * Genera token JWT, setea cookie httpOnly y retorna respuesta uniforme.
   * @param {Object} user - Documento de usuario (de Mongoose) ya validado por Passport
   * @param {import('express').Response} res - Response para setear cookie
   * @returns {{status:number, message:string, token?:string}}
   */
  async generateAuthResponse(user, res) {
    console.log('SessionsService.generateAuthResponse user:', user)
    try {
      // Payload mínimo y seguro (sin password ni datos sensibles) == dto
      const payload = {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }

      const token = jwt.sign({ user: payload }, env.jwt.privateKey /* config.jwt.privateKey */, {
        expiresIn: env.jwt.expiresIn
      })

      // Seteamos cookie httpOnly para escenarios donde prefieras cookies
      res.cookie(env.cookie.name, token, {
        httpOnly: true,
        sameSite: env.cookie.sameSite,
        maxAge: env.cookie.maxAge,
        secure: env.cookie.secure // true en producción (HTTPS), false en dev
      })

      return {
        status: 200,
        message: 'Usuario autenticado correctamente',
        token
      }
    } catch (error) {
      console.error('SessionsService.generateAuthResponse error:', error)
      throw { status: 500, message: 'Error al generar el token de autenticación' }
    }
  }

  // 👤 Obtiene los datos actuales del usuario autenticado
  async getCurrentUser(user) {
    try {
      if (!user?.email) {
        return { status: 400, message: 'Datos de usuario inválidos en el token' }
      }

      const dbUser = await usersService.getUser(user.email)
      if (!dbUser) {
        return { status: 404, message: 'Usuario no encontrado o eliminado' }
      }
      // Retorna información segura (sin password ni datos sensibles)
      const safeUser = {
        id: dbUser._id,
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        email: dbUser.email,
        role: dbUser.role
      }
      return { status: 200, message: 'Usuario autenticado correctamente', user: safeUser }
    } catch (error) {
      console.error('SessionsService.getCurrentUser error:', error)
      throw { status: 500, message: 'Error al obtener la información del usuario actual' }
    }
  }

  // 🚪 Logout (solo registro o validación)
  async logoutUser(user) {
    try {
      if (!user?.email) {
        return { status: 400, message: 'Usuario inválido o no autenticado' }
      }

      // Opcional: registrar logout en DB
      // await usersService.updateLastLogout(user.email)

      return {
        status: 200,
        message: `Logout exitoso para ${user.email}. El token debe eliminarse del cliente.`
      }
    } catch (error) {
      console.error('SessionsService.logoutUser error:', error)
      throw { status: 500, message: 'Error al cerrar sesión' }
    }
  }
}

export default SessionsService
