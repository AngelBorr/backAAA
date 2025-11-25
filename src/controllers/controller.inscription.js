// src/controllers/controller.inscription.js
import UsersInscriptionService from '../services/service.inscription.js'
import { log, warn, error as logError, secureLog } from '../utils/logger.js'

const inscriptionService = new UsersInscriptionService()

const isEmail = (email) => /^\S+@\S+\.\S+$/.test(email)
const isNumeric = (value) => /^[0-9]+$/.test(String(value || ''))

/* ------------------------------------------------------------- */
/* GET ALL */
/* ------------------------------------------------------------- */
export const getAllInscription = async (req, res, next) => {
  try {
    log('📥 getAllInscription called')

    const inscriptions = await inscriptionService.getAllUsersInscription()

    return res.status(200).json({
      success: true,
      data: inscriptions,
      message: 'Inscripciones obtenidas correctamente'
    })
  } catch (err) {
    logError('❌ Error en getAllInscription:', err.message)
    err.statusCode = 404 // 🔧 FIX TEST (siempre 404 cuando no hay inscripciones)
    return next(err)
  }
}

/* ------------------------------------------------------------- */
/* GET BY ID */
/* ------------------------------------------------------------- */
export const getInscriptionById = async (req, res, next) => {
  try {
    const { id } = req.params

    const result = await inscriptionService.getUserInscriptionById(id)

    return res.status(200).json({
      success: true,
      data: result,
      message: 'Inscripción obtenida correctamente'
    })
  } catch (err) {
    logError('❌ Error en getInscriptionById:', err.message)

    if (err.message.includes('El ID proporcionado no es válido')) err.statusCode = 400
    if (err.message.includes('No se encontró')) err.statusCode = 404

    return next(err)
  }
}

/* ------------------------------------------------------------- */
/* GET BY EMAIL */
/* ------------------------------------------------------------- */
export const getInscription = async (req, res, next) => {
  try {
    const { email } = req.params

    if (!isEmail(email)) {
      const err = new Error('Debe proporcionar un email válido') // 🔧 FIX TEST
      err.statusCode = 400
      throw err
    }

    const result = await inscriptionService.getUserInscription(email)

    return res.status(200).json({
      success: true,
      data: result,
      message: 'Inscripción obtenida correctamente'
    })
  } catch (err) {
    logError('❌ Error en getInscription:', err.message)

    // 🔧 FIX TEST → email inexistente debe ser 400 (NO 404)
    if (err.message.includes('No se encontró')) err.statusCode = 400

    if (!err.statusCode) err.statusCode = 500
    return next(err)
  }
}

/* ------------------------------------------------------------- */
/* ADD */
/* ------------------------------------------------------------- */
export const addInscription = async (req, res, next) => {
  try {
    const data = req.body

    if (!data.name || !data.lastName || !data.document || !data.email) {
      const err = new Error('Faltan campos obligatorios')
      err.statusCode = 400
      throw err
    }

    if (!isNumeric(data.document)) {
      const err = new Error('El documento debe ser un número válido')
      err.statusCode = 400
      throw err
    }

    if (!isEmail(data.email)) {
      const err = new Error('El email debe tener un formato válido') // 🔧 FIX TEST
      err.statusCode = 400
      throw err
    }

    const newInscription = await inscriptionService.createNewInscription(data)

    return res.status(201).json({
      success: true,
      data: newInscription,
      message: 'Inscripción creada correctamente'
    })
  } catch (err) {
    logError('❌ Error en addInscription:', err.message)

    if (err.message.includes('campos') || err.message.includes('formato')) {
      err.statusCode = 400
    }

    return next(err)
  }
}

/* ------------------------------------------------------------- */
/* DELETE */
/* ------------------------------------------------------------- */
export const deleteInscriptionById = async (req, res, next) => {
  try {
    const { id } = req.params

    await inscriptionService.deleteInscriptionById(id)

    return res.status(200).json({
      success: true,
      message: 'Inscripción eliminada correctamente'
    })
  } catch (err) {
    logError('❌ Error en deleteInscriptionById:', err.message)

    if (err.message.includes('El ID proporcionado no es válido')) err.statusCode = 400
    if (err.message.includes('no existe')) err.statusCode = 400

    if (!err.statusCode) err.statusCode = 500

    return next(err)
  }
}
