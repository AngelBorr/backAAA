import dotenv from 'dotenv'
dotenv.config()

const env = {
  // 🌎 SERVER
  port: process.env.PORT || 8080,
  nodeEnv: process.env.NODE_ENV || 'development',

  // 🗄️ DATABASE
  mongo: {
    user: process.env.USER_MONGO,
    pass: process.env.PASS_MONGO,
    cluster: process.env.DB_CLUSTER,
    name: process.env.DB_NAME,
    url: `mongodb+srv://${process.env.USER_MONGO}:${process.env.PASS_MONGO}@${process.env.DB_CLUSTER}/${process.env.DB_NAME}?retryWrites=true&w=majority`
  },

  // 🗝️ KEYS
  privateKey: process.env.PRIVATE_KEY || 'devAAASecretKey10', // para usos no-JWT
  jwt: {
    privateKey: process.env.JWT_PRIVATE_KEY || 'devFallbackKey',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h'
  },

  // 🍪 COOKIE
  cookie: {
    name: process.env.COOKIE_NAME || 'cookieToken',
    maxAge: Number(process.env.cookie_MAX_AGE) || Number(process.env.COOKIE_MAX_AGE) || 3600000,
    sameSite: process.env.COOKIE_SAME_SITE || 'none',
    secure: true
  },

  // 🔑 SESSION (opcional)
  session: {
    secret: process.env.DATASESSION || 'sessionSecretAAA'
  },

  // 📧 NODEMAIL
  email: {
    user: process.env.USER_EMAIL,
    pass: process.env.PASS_EMAIL,
    host: process.env.EMAIL_HOST || null,
    port: process.env.EMAIL_PORT ? Number(process.env.EMAIL_PORT) : null
  },

  debugMailSecret: process.env.DEBUG_MAIL_SECRET || 'MiClaveSuperSegura123'
}

export default env
