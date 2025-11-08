import SessionsService from '../services/service.sessions.js'

const sessionsService = new SessionsService()

export const loginUser = async (req, res) => {
  try {
    // 🧠 Passport coloca el usuario validado en req.user
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Credenciales inválidas'
      })
    }

    // 🔹 Genera token y mensaje
    const result = await sessionsService.generateAuthResponse(req.user)

    // ✅ Garantizamos un código HTTP válido
    const status = result?.status || 500

    return res.status(status).json({
      status: status === 200 ? 'success' : 'error',
      message: result?.message || 'Error al generar autenticación',
      token: result?.token ?? null
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
