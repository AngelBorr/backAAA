import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import app from '../src/app.js' // Asegúrate de que esta ruta sea correcta

let mongoServer

// Configuración antes de todos los tests
before(async function () {
  this.timeout(30000)

  // Cerrar cualquier conexión existente de Mongoose
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect()
  }

  // Crear instancia de MongoDB en memoria
  mongoServer = await MongoMemoryServer.create()
  const mongoUri = mongoServer.getUri()

  // Configurar Mongoose para la conexión de tests
  mongoose.set('strictQuery', false)

  // Conectar a la base de datos en memoria
  try {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    console.log('✅ Conectado a MongoDB en memoria para tests')
  } catch (error) {
    console.error('❌ Error conectando a MongoDB en memoria:', error)
    throw error
  }
})

// Limpiar base de datos después de cada test
afterEach(async () => {
  try {
    const collections = mongoose.connection.collections
    for (const key in collections) {
      await collections[key].deleteMany()
    }
  } catch (error) {
    console.error('Error limpiando base de datos:', error)
  }
})

// Desconectar y detener servidor después de todos los tests
after(async () => {
  try {
    await mongoose.disconnect()
    await mongoServer.stop()
    console.log('✅ Conexión de tests cerrada correctamente')
  } catch (error) {
    console.error('Error cerrando conexión:', error)
  }
})

// ✅ EXPORTAR app para que los tests puedan usarlo
export { app }
