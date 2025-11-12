import jwt from 'jsonwebtoken'
import env from '../config.js'

/**
 * Middleware para controlar acceso basado en JWT vía cookie httpOnly.
 * 🔐 Usa el nombre de cookie definido en env.cookie.name (ej: cookieToken)
 */
const handlePolicies = (policies) => (req, res, next) => {
  try {
    console.log('🔵 [handlePolicies] Ejecutando...')

    // Rutas públicas → acceso directo
    if (policies[0]?.toUpperCase() === 'PUBLIC') {
      console.log('🟢 Ruta pública → acceso automático')
      return next()
    }

    // Leer token desde cookie
    const token = req.cookies?.[env.cookie.name]
    console.log('🟢 Token desde la cookie', token)
    if (!token) {
      console.log('❌ Cookie no encontrada en req.cookies')
      return res.status(401).json({
        status: 'error',
        message: 'No autenticado. Cookie faltante.'
      })
    }

    // Verificar token
    let decoded
    try {
      decoded = jwt.verify(token, env.jwt.privateKey)
    } catch (err) {
      console.log('❌ Error verificando JWT:', err.message)
      return res.status(401).json({
        status: 'error',
        message: 'Token inválido o expirado.'
      })
    }

    // Validar payload
    if (!decoded?.user) {
      console.log('❌ Estructura del token inválida')
      return res.status(401).json({
        status: 'error',
        message: 'Token corrupto o incompleto.'
      })
    }

    // Validar rol
    const userRole = decoded.user.role?.toUpperCase()
    if (!policies.includes(userRole)) {
      console.log(`🚫 Rol '${userRole}' no autorizado. Requiere uno de: ${policies}`)
      return res.status(403).json({
        status: 'error',
        message: 'Acceso denegado. Rol no autorizado.'
      })
    }

    // Inyectar usuario al request
    req.user = decoded.user
    console.log('✅ Usuario autenticado:', decoded.user.email)
    next()
  } catch (error) {
    console.error('❌ Error en handlePolicies:', error)
    return res.status(500).json({
      status: 'error',
      message: 'Error interno en la autenticación.'
    })
  }
}

export default handlePolicies
