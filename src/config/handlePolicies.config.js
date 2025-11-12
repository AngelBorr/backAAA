import jwt from 'jsonwebtoken'
import env from '../config.js'

const handlePolicies = (policies) => (req, res, next) => {
  try {
    if (policies[0]?.toUpperCase() === 'PUBLIC') return next()

    const token = req.cookies?.[env.cookie.name]
    if (!token) {
      return res.status(401).json({ status: 'error', message: 'No autenticado. Token ausente.' })
    }

    let decoded
    try {
      decoded = jwt.verify(token, env.jwt.privateKey) // ✅ usa JWT_PRIVATE_KEY
    } catch (err) {
      return res.status(401).json({ status: 'error', message: 'Token inválido o expirado.' })
    }

    if (!decoded?.user) {
      return res.status(401).json({ status: 'error', message: 'Token corrupto.' })
    }

    const role = decoded.user.role?.toUpperCase()
    if (!policies.includes(role)) {
      return res
        .status(403)
        .json({ status: 'error', message: 'Acceso denegado. Rol insuficiente.' })
    }

    req.user = decoded.user
    next()
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Error interno en autenticación' })
  }
}

export default handlePolicies
