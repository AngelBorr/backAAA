import UsersInscriptionManager from '../dao/managers/mongo/usersInscription.mongo.js'
import mongoose from 'mongoose'

class UsersInscriptionService {
  constructor() {
    this.usersInscription = new UsersInscriptionManager()
  }

  // ✅ Obtener todas las inscripciones
  async getAllUsersInscription() {
    const inscriptions = await this.usersInscription.getAllInscription()
    if (!inscriptions || inscriptions.length === 0) {
      throw new Error('No se han encontrado usuarios inscriptos')
    }
    return inscriptions
  }

  // ✅ Obtener inscripción por email
  async getUserInscription(email) {
    if (!email || typeof email !== 'string') {
      throw new Error('Debe proporcionar un email válido')
    }

    const userInscription = await this.usersInscription.getInscription(email)
    if (!userInscription) {
      throw new Error('No se encontró un usuario con ese email')
    }

    return userInscription
  }

  // ✅ Obtener inscripción por ID
  async getUserInscriptionById(id) {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('El ID proporcionado no es válido')
    }

    const userInscription = await this.usersInscription.getInscriptionId(id)
    if (!userInscription) {
      throw new Error('No se encontró una inscripción con ese ID')
    }

    return userInscription
  }

  // ✅ Crear nueva inscripción
  async createNewInscription(body) {
    // Validación de estructura básica
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      throw new Error('Los datos enviados no son válidos')
    }

    // Validación de campos obligatorios según el modelo
    const requiredFields = [
      'name',
      'lastName',
      'document',
      'nationality',
      'birthDate',
      'email',
      'cellPhone',
      'address',
      'province',
      'locality',
      'occupation',
      'studies',
      'sportBackground'
    ]

    const missingFields = requiredFields.filter((field) => !body[field])
    if (missingFields.length > 0) {
      throw new Error(`Faltan campos obligatorios: ${missingFields.join(', ')}`)
    }

    // Validaciones específicas por tipo de dato
    const validations = [
      {
        field: 'name',
        validator: (value) => typeof value === 'string' && value.trim().length > 0,
        message: 'El nombre debe ser un texto válido'
      },
      {
        field: 'lastName',
        validator: (value) => typeof value === 'string' && value.trim().length > 0,
        message: 'El apellido debe ser un texto válido'
      },
      {
        field: 'document',
        validator: (value) => Number.isInteger(value) && value > 0,
        message: 'El documento debe ser un número entero positivo'
      },
      {
        field: 'nationality',
        validator: (value) => typeof value === 'string' && value.trim().length > 0,
        message: 'La nacionalidad debe ser un texto válido'
      },
      {
        field: 'birthDate',
        validator: (value) => !isNaN(Date.parse(value)),
        message: 'La fecha de nacimiento debe ser una fecha válida'
      },
      {
        field: 'email',
        validator: (value) => {
          const emailRegex = /^\S+@\S+\.\S+$/
          return typeof value === 'string' && emailRegex.test(value)
        },
        message: 'El email debe tener un formato válido (ejemplo: usuario@dominio.com)'
      },
      {
        field: 'cellPhone',
        validator: (value) => Number.isInteger(value) && value > 0,
        message: 'El celular debe ser un número válido'
      },
      {
        field: 'address',
        validator: (value) => typeof value === 'string' && value.trim().length > 0,
        message: 'La dirección debe ser un texto válido'
      },
      {
        field: 'province',
        validator: (value) => typeof value === 'string' && value.trim().length > 0,
        message: 'La provincia debe ser un texto válido'
      },
      {
        field: 'locality',
        validator: (value) => typeof value === 'string' && value.trim().length > 0,
        message: 'La localidad debe ser un texto válido'
      },
      {
        field: 'occupation',
        validator: (value) => typeof value === 'string' && value.trim().length > 0,
        message: 'La ocupación debe ser un texto válido'
      },
      {
        field: 'studies',
        validator: (value) => typeof value === 'string' && value.trim().length > 0,
        message: 'Los estudios deben ser un texto válido'
      },
      {
        field: 'sportBackground',
        validator: (value) => typeof value === 'string' && value.trim().length > 0,
        message: 'El antecedente deportivo debe ser un texto válido'
      }
    ]

    // Validaciones para campos opcionales (si están presentes)
    const optionalValidations = [
      {
        field: 'placeOfBirth',
        validator: (value) => typeof value === 'string',
        message: 'El lugar de nacimiento debe ser un texto válido'
      },
      {
        field: 'postalCode',
        validator: (value) => value === undefined || (Number.isInteger(value) && value > 0),
        message: 'El código postal debe ser un número válido'
      }
    ]

    // Ejecutar validaciones obligatorias
    for (const validation of validations) {
      if (!validation.validator(body[validation.field])) {
        throw new Error(validation.message)
      }
    }

    // Ejecutar validaciones opcionales
    for (const validation of optionalValidations) {
      if (body[validation.field] !== undefined && !validation.validator(body[validation.field])) {
        throw new Error(validation.message)
      }
    }

    // Validación adicional: formato de email (más específica)
    const email = body.email.trim()
    if (email.length > 254) {
      throw new Error('El email no puede exceder los 254 caracteres')
    }

    // Validación adicional: fecha de nacimiento razonable
    const birthDate = new Date(body.birthDate)
    const today = new Date()
    const minDate = new Date('1900-01-01')

    if (birthDate > today) {
      throw new Error('La fecha de nacimiento no puede ser futura')
    }

    if (birthDate < minDate) {
      throw new Error('La fecha de nacimiento no puede ser anterior a 1900')
    }

    // Validación adicional: documento no negativo
    if (body.document < 0) {
      throw new Error('El documento no puede ser negativo')
    }

    // Validación adicional: celular no negativo
    if (body.cellPhone < 0) {
      throw new Error('El celular no puede ser negativo')
    }

    // Limpiar y formatear datos antes de enviar a MongoDB
    const cleanedData = {
      name: body.name.trim(),
      lastName: body.lastName.trim(),
      document: body.document,
      nationality: body.nationality.trim(),
      birthDate: birthDate,
      email: email.toLowerCase(),
      cellPhone: body.cellPhone,
      address: body.address.trim(),
      province: body.province.trim(),
      locality: body.locality.trim(),
      occupation: body.occupation.trim(),
      studies: body.studies.trim(),
      sportBackground: body.sportBackground.trim()
    }

    // Agregar campos opcionales si están presentes
    if (body.placeOfBirth) {
      cleanedData.placeOfBirth = body.placeOfBirth.trim()
    }

    if (body.postalCode) {
      cleanedData.postalCode = body.postalCode
    }

    try {
      const newInscription = await this.usersInscription.createInscription(cleanedData)
      return newInscription
    } catch (error) {
      // Manejo específico de errores de MongoDB
      if (error.code === 11000) {
        throw new Error('El email ya está registrado en el sistema')
      }
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map((err) => err.message)
        throw new Error(`Error de validación: ${messages.join(', ')}`)
      }
      throw new Error('Error al crear la inscripción en la base de datos')
    }
  }

  // ✅ Eliminar inscripción por ID
  async deleteInscriptionById(id) {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('El ID proporcionado no es válido')
    }

    const userInscription = await this.usersInscription.getInscriptionId(id)
    if (!userInscription) {
      throw new Error('La inscripción no existe')
    }

    const deleted = await this.usersInscription.deleteInscription(id)
    if (!deleted) {
      throw new Error('No se pudo eliminar la inscripción')
    }

    return deleted
  }
}

export default UsersInscriptionService
