import jwt from 'jsonwebtoken'
import env from '../config.js'

/**
 * Middleware para controlar acceso basado exclusivamente en JWT vía cookie httpOnly.
 * ✅ SOLO Cookie
 * ✅ Manejo de roles
 * ✅ Manejo de token expirado / inválido
 */
const handlePolicies = (policies) => (req, res, next) => {
  try {
    console.log('🔵 [handlePolicies] Ejecutando...')

    // ✅ Caso 1 — Ruta pública
    if (policies[0]?.toUpperCase() === 'PUBLIC') {
      console.log('🟢 Ruta pública → acceso automático')
      return next()
    }

    // ✅ Caso 2 — Obtener token desde cookie httpOnly
    const token = req.cookies?.jwtCookie
    if (!token) {
      console.log('❌ No existe cookie jwtCookie')
      return res.status(401).json({
        status: 'error',
        message: 'No autenticado. Cookie faltante.'
      })
    }

    // ✅ Caso 3 — Verificar token
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

    if (!decoded?.user) {
      console.log('❌ Token no contiene estructura válida')
      return res.status(401).json({
        status: 'error',
        message: 'Token corrupto.'
      })
    }

    console.log('✅ Token decodificado:', decoded.user)

    // ✅ Caso 4 — Validar rol
    const userRole = decoded.user.role?.toUpperCase()

    if (!policies.includes(userRole)) {
      console.log(`❌ Rol '${userRole}' no permitido → requiere: ${policies}`)
      return res.status(403).json({
        status: 'error',
        message: 'Acceso denegado. Rol no autorizado.'
      })
    }

    // ✅ Caso 5 — Inyectar usuario en req
    req.user = decoded.user

    console.log('🟢 Acceso concedido a:', userRole)
    next()
  } catch (error) {
    console.error('❌ Error en handlePolicies:', error)
    return res.status(401).json({
      status: 'error',
      message: 'Error en autenticación.'
    })
  }
}

export default handlePolicies
