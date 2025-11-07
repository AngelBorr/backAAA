import SessionsService from '../services/service.sessions.js'

const sessionsService = new SessionsService()

export const loginUser = async (req, res) => {
  try {
    // Passport coloca el usuario validado en req.user
    if (!req.user) {
      return res.status(401).json({ status: 'error', message: 'Credenciales inválidas' })
    }

    const result = await sessionsService.generateAuthResponse(req.user, res)
    return res.status(result.status).json({
      status: result.status === 200 ? 'success' : 'error',
      message: result.message,
      token: result.token ?? null
    })
  } catch (error) {
    console.error('controller.sessions.loginUser error:', error)
    return res.status(error.status || 500).json({
      status: 'error',
      message: error.message || 'Error interno del servidor'
    })
  }
}

export const failLogin = (req, res) => {
  return res.status(401).json({ status: 'error', message: 'Fallo en autenticación de login' })
}

export const currentUser = async (req, res) => {
  try {
    const result = await sessionsService.getCurrentUser(req.user)
    return res.status(result.status).json(result)
  } catch (error) {
    console.error('controller.sessions.currentUser error:', error)
    res.status(error.status || 500).json({
      status: 'error',
      message: error.message || 'Error interno del servidor'
    })
  }
}

export const logoutUser = async (req, res) => {
  try {
    const result = await sessionsService.logoutUser(req.user)
    return res.status(result.status).json(result)
  } catch (error) {
    console.error('controller.sessions.logoutUser error:', error)
    res.status(error.status || 500).json({
      status: 'error',
      message: error.message || 'Error interno al cerrar sesión'
    })
  }
}
