import jwt from 'jsonwebtoken'
import env from '../config.js'

/**
 * Middleware para controlar el acceso basado en roles y JWT.
 * @param {Array<string>} policies - Lista de roles permitidos (ej. ['ADMIN', 'USER']) o ['PUBLIC'] para libre acceso.
 */
const handlePolicies = (policies) => (req, res, next) => {
  try {
    // 🔓 Acceso libre si la política es pública
    if (policies[0] === 'PUBLIC') return next()

    // 🔍 Verificamos que exista un encabezado Authorization con formato Bearer
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res
        .status(401)
        .json({ status: 'error', message: 'No autorizado. Token faltante o inválido.' })
    }

    // ✨ Extraemos el token
    const token = authHeader.split(' ')[1]
    if (!token) {
      return res.status(401).json({ status: 'error', message: 'Token no proporcionado.' })
    }

    // 🧾 Verificamos el token
    const decoded = jwt.verify(token, env.jwt.privateKey)
    const userRole = decoded.user?.role?.toUpperCase()

    // 🚫 Verificación de rol
    if (!userRole || !policies.includes(userRole)) {
      return res
        .status(403)
        .json({ status: 'error', message: 'Acceso denegado. Rol no autorizado.' })
    }

    // ✅ Inyectamos el usuario en la request
    req.user = decoded.user
    next()
  } catch (error) {
    console.error('Error en handlePolicies:', error)
    return res.status(401).json({
      status: 'error',
      message: 'Token inválido o expirado.'
    })
  }
}

export default handlePolicies
