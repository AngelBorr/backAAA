import dotenv from 'dotenv'

dotenv.config()

export default {
  port: process.env.PORT,
  userMongo: process.env.USER_MONGO,
  passMongo: process.env.PASS_MONGO,
  dbColecction: process.env.DB_NAME,
  dbCluster: process.env.DB_CLUSTER,
  persistence: process.env.PERSISTENCE,
  entorno: process.env.NODE_ENV,
  keyPrivate: process.env.PRIVATE_KEY,
  secret: process.env.DATASESSION
}
