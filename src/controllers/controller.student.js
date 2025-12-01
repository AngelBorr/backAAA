// src/controllers/controller.student.js
import StudentsService from '../services/service.student.js'
import { log, warn, error as logError } from '../utils/logger.js'

const studentService = new StudentsService()

// ======================================================
// GET ALL
// ======================================================
export const getStudents = async (req, res) => {
  const result = await studentService.getAllStudents()

  if (!result.success) {
    logError(`❌ [Students] Error en getStudents: ${result.error}`)
    return res.status(500).json({
      status: 'error',
      message: 'Error al obtener estudiantes'
    })
  }

  return res.status(200).json({
    status: 'success',
    message: 'Estudiantes obtenidos correctamente',
    payload: result.data
  })
}

// ======================================================
// GET BY ID
// ======================================================
export const getStudentById = async (req, res) => {
  const { id } = req.params
  const result = await studentService.getStudentById(id)

  if (!result.success) {
    logError(`❌ [Students] Error en getStudentById: ${result.error}`)
    return res.status(500).json({
      status: 'error',
      message: 'Error al obtener estudiante'
    })
  }

  if (!result.data) {
    return res.status(404).json({
      status: 'error',
      message: 'Estudiante no encontrado'
    })
  }

  return res.status(200).json({
    status: 'success',
    message: 'Estudiante obtenido correctamente',
    payload: result.data
  })
}

// ======================================================
// ADD STUDENT
// ======================================================
export const addStudent = async (req, res) => {
  const { file, body } = req

  if (!file) {
    return res.status(400).json({
      status: 'error',
      message: 'Debe subir un archivo'
    })
  }

  const result = await studentService.addStudent(body, file)

  if (!result.success) {
    return res.status(500).json({
      status: 'error',
      message: 'Error al registrar estudiante',
      error: result.error
    })
  }

  return res.status(200).json({
    status: 'success',
    message: result.message,
    payload: result.data
  })
}

// ======================================================
// DELETE
// ======================================================
export const deleteStudent = async (req, res) => {
  const { id } = req.params
  const result = await studentService.deleteStudentById(id)

  if (!result.success) {
    // estudiante no existe
    if (result.message === 'El estudiante no existe') {
      return res.status(404).json({
        status: 'error',
        message: result.message
      })
    }

    // error al borrar archivo o estudiante
    return res.status(400).json({
      status: 'error',
      message: result.message || 'Error al eliminar estudiante'
    })
  }

  return res.status(200).json({
    status: 'success',
    message: result.message
  })
}

// ======================================================
// GET BY ID PUBLIC
// ======================================================
export const getStudentByIdPublic = async (req, res) => {
  const { id } = req.params

  const result = await studentService.getStudentById(id)

  if (!result.success) {
    logError(`❌ [Students-Public] Error en getStudentByIdPublic: ${result.error}`)
    return res.status(500).json({
      status: 'error',
      message: 'Error al obtener estudiante'
    })
  }

  if (!result.data) {
    return res.status(404).json({
      status: 'error',
      message: 'Estudiante no encontrado'
    })
  }

  const student = result.data

  // ======================================================
  // 🔒 SANITIZACIÓN DE DATOS (solo datos públicos permitidos)
  // ======================================================
  const safeStudent = {
    id: student._id,
    firstName: student.firstName,
    lastName: student.lastName,
    dni: student.dni,
    photoUrl: student.documents?.[0]?.reference || null
  }

  return res.status(200).json({
    status: 'success',
    message: 'Estudiante público obtenido correctamente',
    payload: safeStudent
  })
}
