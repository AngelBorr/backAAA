import jwt from 'jsonwebtoken'
import env from '../config.js'
import UsersService from './service.users.js'

const usersService = new UsersService()

class SessionsService {
  /**
   * 🔐 Genera token JWT y setea cookie httpOnly segura.
   * Se usa en /api/sessions/login luego de validar credenciales por Passport.
   */
  async generateAuthResponse(user, res) {
    try {
      // 1️⃣ Construir el payload (sin password)
      const payload = {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }

      // 2️⃣ Generar JWT con clave privada del entorno
      const token = jwt.sign({ user: payload }, env.jwt.privateKey, {
        expiresIn: env.jwt.expiresIn
      })

      // 3️⃣ Establecer cookie httpOnly segura (compatible con cross-site)
      res.cookie(env.cookie.name, token, {
        httpOnly: true, // No accesible desde JS → protege contra XSS
        secure: true, // Requiere HTTPS → obligatorio para SameSite=None
        sameSite: 'none', // Permite compartir cookie entre dominios (Railway + Vercel)
        maxAge: env.cookie.maxAge // Duración (ms)
      })

      console.log('✅ Cookie JWT seteada correctamente:', env.cookie.name)

      return {
        status: 200,
        message: 'Usuario autenticado correctamente'
      }
    } catch (error) {
      console.error('❌ SessionsService.generateAuthResponse error:', error)
      return {
        status: 500,
        message: 'Error al generar el token de autenticación'
      }
    }
  }

  /**
   * 👤 Retorna los datos del usuario autenticado según el token JWT.
   * El middleware handlePolicies inyecta req.user si el token es válido.
   */
  async getCurrentUser(user) {
    try {
      if (!user?.email) {
        return { status: 400, message: 'Datos de usuario inválidos en el token' }
      }

      const dbUser = await usersService.getUser(user.email)
      if (!dbUser) {
        return { status: 404, message: 'Usuario no encontrado' }
      }

      const safeUser = {
        id: dbUser._id,
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        email: dbUser.email,
        role: dbUser.role
      }

      return {
        status: 200,
        message: 'Usuario autenticado correctamente',
        user: safeUser
      }
    } catch (error) {
      console.error('❌ SessionsService.getCurrentUser error:', error)
      return { status: 500, message: 'Error al obtener datos del usuario' }
    }
  }

  /**
   * 🚪 Cierre de sesión → limpia cookie y responde al cliente.
   */
  async logoutUser(res, user) {
    try {
      res.clearCookie(env.cookie.name, {
        httpOnly: true,
        secure: true,
        sameSite: 'none'
      })

      const email = user?.email || 'usuario desconocido'
      console.log(`👋 Logout exitoso para: ${email}`)

      return {
        status: 200,
        message: `Logout exitoso para ${email}`
      }
    } catch (error) {
      console.error('❌ SessionsService.logoutUser error:', error)
      return { status: 500, message: 'Error al cerrar sesión' }
    }
  }
}

export default SessionsService
