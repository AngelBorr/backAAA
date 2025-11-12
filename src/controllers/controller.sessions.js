import SessionsService from '../services/service.sessions.js'
import env from '../config.js'

const sessionsService = new SessionsService()

export const loginUser = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ status: 'error', message: 'Credenciales inválidas' })
    }

    const result = await sessionsService.generateAuthResponse(req.user, res)
    return res.status(result.status).json({
      status: result.status === 200 ? 'success' : 'error',
      message: result.message
    })
  } catch (error) {
    console.error('controller.sessions.loginUser error:', error)
    return res.status(500).json({ status: 'error', message: 'Error interno del servidor' })
  }
}

export const failLogin = (_, res) =>
  res.status(401).json({ status: 'error', message: 'Fallo en autenticación' })

export const currentUser = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ status: 'error', message: 'Usuario no autenticado' })
    }
    const result = await sessionsService.getCurrentUser(req.user)
    return res.status(result.status).json(result)
  } catch (error) {
    console.error('controller.sessions.currentUser error:', error)
    return res.status(500).json({ status: 'error', message: 'Error interno del servidor' })
  }
}

export const logoutUser = async (req, res) => {
  try {
    res.clearCookie(env.cookie.name, {
      httpOnly: true,
      secure: env.cookie.secure,
      sameSite: env.cookie.sameSite
    })
    const result = await sessionsService.logoutUser(req.user)
    return res.status(result.status).json(result)
  } catch (error) {
    console.error('controller.sessions.logoutUser error:', error)
    return res.status(500).json({ status: 'error', message: 'Error interno al cerrar sesión' })
  }
}
