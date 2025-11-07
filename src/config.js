import dotenv from 'dotenv'

dotenv.config()

export default {
  // 🌎 SERVER CONFIG
  port: process.env.PORT || 8080,
  entorno: process.env.NODE_ENV || 'development',

  // 🗄️ DATABASE (MongoDB Atlas)
  mongo: {
    user: process.env.USER_MONGO,
    pass: process.env.PASS_MONGO,
    cluster: process.env.DB_CLUSTER,
    name: process.env.DB_NAME,
    // URL construida automáticamente
    url: `mongodb+srv://${process.env.USER_MONGO}:${process.env.PASS_MONGO}@${process.env.DB_CLUSTER}/${process.env.DB_NAME}?retryWrites=true&w=majority`
  },

  // 🔐 JWT CONFIG
  jwt: {
    privateKey: process.env.PRIVATE_KEY || 'devAAA',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h'
  },

  // 🍪 COOKIE CONFIG
  cookie: {
    name: process.env.COOKIE_NAME || 'cookieToken',
    maxAge: Number(process.env.COOKIE_MAX_AGE) || 3600000,
    sameSite: process.env.COOKIE_SAME_SITE || 'strict',
    secure: process.env.NODE_ENV === 'production'
  },

  // 🔑 SESSION (si algún módulo lo usa)
  session: {
    secret: process.env.DATASESSION || 'sessionSecretAAA'
  }
}
