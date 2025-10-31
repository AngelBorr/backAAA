import UsersInscriptionService from '../services/service.inscription.js'

const inscriptionService = new UsersInscriptionService()

// ✅ Obtener todas las inscripciones
export const getAllInscription = async (req, res) => {
  try {
    const inscriptions = await inscriptionService.getAllUsersInscription()
    return res.status(200).json({
      success: true,
      data: inscriptions,
      message: 'Inscripciones obtenidas correctamente'
    })
  } catch (error) {
    console.error('Error en getAllInscription (Controller):', error)

    if (error.message.includes('No se han encontrado')) {
      return res.status(404).json({
        success: false,
        message: error.message
      })
    }

    return res.status(500).json({
      success: false,
      message: 'Error interno al obtener las inscripciones'
    })
  }
}

// ✅ Obtener inscripción por ID
export const getInscriptionById = async (req, res) => {
  try {
    const { id } = req.params
    const inscription = await inscriptionService.getUserInscriptionById(id)

    return res.status(200).json({
      success: true,
      data: inscription,
      message: 'Inscripción obtenida correctamente'
    })
  } catch (error) {
    console.error('Error en getInscriptionById (Controller):', error)

    if (error.message.includes('ID proporcionado no es válido')) {
      return res.status(400).json({
        success: false,
        message: error.message
      })
    }

    if (error.message.includes('No se encontró')) {
      return res.status(404).json({
        success: false,
        message: error.message
      })
    }

    return res.status(500).json({
      success: false,
      message: 'Error interno al buscar la inscripción'
    })
  }
}

// ✅ Obtener inscripción por email
export const getInscription = async (req, res) => {
  try {
    const { email } = req.params
    const inscription = await inscriptionService.getUserInscription(email)

    return res.status(200).json({
      success: true,
      data: inscription,
      message: 'Inscripción obtenida correctamente'
    })
  } catch (error) {
    console.error('Error en getInscription (Controller):', error)

    if (error.message.includes('email válido') || error.message.includes('No se encontró')) {
      return res.status(400).json({
        success: false,
        message: error.message
      })
    }

    return res.status(500).json({
      success: false,
      message: 'Error interno al buscar por email'
    })
  }
}

// ✅ Crear nueva inscripción
export const addInscription = async (req, res) => {
  try {
    const data = req.body
    const newInscription = await inscriptionService.createNewInscription(data)

    return res.status(201).json({
      success: true,
      data: newInscription,
      message: 'Inscripción creada correctamente'
    })
  } catch (error) {
    console.error('Error en addInscription (Controller):', error)

    if (error.message.includes('datos enviados') || error.message.includes('campos obligatorios')) {
      return res.status(400).json({
        success: false,
        message: error.message
      })
    }

    return res.status(500).json({
      success: false,
      message: 'Error interno al crear la inscripción'
    })
  }
}

// ✅ Eliminar inscripción por ID
export const deleteInscriptionById = async (req, res) => {
  try {
    const { id } = req.params
    await inscriptionService.deleteInscriptionById(id)

    return res.status(200).json({
      success: true,
      message: 'Inscripción eliminada correctamente'
    })
  } catch (error) {
    console.error('Error en deleteInscriptionById (Controller):', error)

    if (
      error.message.includes('ID proporcionado no es válido') ||
      error.message.includes('no existe')
    ) {
      return res.status(400).json({
        success: false,
        message: error.message
      })
    }

    return res.status(500).json({
      success: false,
      message: 'Error interno al eliminar la inscripción'
    })
  }
}
