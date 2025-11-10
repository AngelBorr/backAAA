import jwt from 'jsonwebtoken'
import env from '../config.js'

/**
 * Middleware para controlar acceso basado en roles y JWT.
 * Ahora soporta:
 * ✅ Cookie httpOnly (jwtCookie)
 * ✅ Header Authorization como fallback
 */
const handlePolicies = (policies) => (req, res, next) => {
  try {
    console.log('🔵 [handlePolicies] Ejecutando...')

    // ✅1. acceso libre si la política es PUBLIC
    if (policies[0]?.toUpperCase() === 'PUBLIC') {
      console.log('🟢 Ruta pública → acceso autorizado')
      return next()
    }

    // ✅2. Leer token desde cookie HttpOnly
    let token = req.cookies?.jwtCookie

    // ✅3. Fallback: si no hay cookie, intentar Authorization header
    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      console.log('⚠️ Usando Authorization header como fallback')
      token = req.headers.authorization.split(' ')[1]
    }

    // ✅4. Si no hay token → no autorizado
    if (!token) {
      console.log('❌ No token found in cookie or header')
      return res.status(401).json({
        status: 'error',
        message: 'No autenticado. Token faltante o inválido.'
      })
    }

    // ✅5. Verificar token
    const decoded = jwt.verify(token, env.jwt.privateKey)
    if (!decoded?.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Token inválido o corrupto.'
      })
    }

    console.log('✅ Token decodificado:', decoded.user)

    // ✅6. Validar rol
    const userRole = decoded.user.role?.toUpperCase()

    if (!policies.includes(userRole)) {
      console.log('❌ Permiso denegado: Rol no autorizado →', userRole)
      return res.status(403).json({
        status: 'error',
        message: 'Acceso denegado. Rol no autorizado.'
      })
    }

    // ✅7. Inyectar usuario en req para uso posterior
    req.user = decoded.user

    console.log('🟢 Permiso concedido a:', userRole)
    next()
  } catch (error) {
    console.error('❌ Error en handlePolicies:', error)
    return res.status(401).json({
      status: 'error',
      message: 'Token inválido o expirado.'
    })
  }
}

export default handlePolicies
