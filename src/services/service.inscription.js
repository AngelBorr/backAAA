// src/services/service.inscription.js
import UsersInscriptionManager from '../dao/managers/mongo/usersInscription.mongo.js'
import mongoose from 'mongoose'
import { log, warn, error as logError, secureLog } from '../utils/logger.js'
/* import MailingService from './service.mailing.js'

const mailingService = new MailingService() */

// 🔄 MailingService se inyecta desde app.js o tests
let mailingService = null
export function injectMailingService(service) {
  mailingService = service
}

class UsersInscriptionService {
  constructor() {
    this.usersInscription = new UsersInscriptionManager()
  }

  /* -------------------------------------------------------------
     🔍 Helper globales para validar
  ------------------------------------------------------------- */
  isEmail(str) {
    return /^\S+@\S+\.\S+$/.test(str)
  }

  isNumeric(value) {
    return /^[0-9]+$/.test(String(value))
  }

  /* -------------------------------------------------------------
     📌 GET ALL
  ------------------------------------------------------------- */
  async getAllUsersInscription() {
    log('📥 Service → getAllUsersInscription')

    const data = await this.usersInscription.getAllInscription()

    if (!data || data.length === 0) {
      throw new Error('No se han encontrado usuarios inscriptos')
    }

    return data
  }

  /* -------------------------------------------------------------
     📌 GET BY EMAIL
  ------------------------------------------------------------- */
  async getUserInscription(email) {
    log(`📥 Service → getUserInscription email=${email}`)

    if (!email || !this.isEmail(email)) {
      throw new Error('Debe proporcionar un email válido') // FIX TEST
    }

    const user = await this.usersInscription.getInscription(email)

    if (!user) {
      throw new Error('No se encontró un usuario con ese email')
    }

    return user
  }

  /* -------------------------------------------------------------
     📌 GET BY ID
  ------------------------------------------------------------- */
  async getUserInscriptionById(id) {
    log(`📥 Service → getUserInscriptionById id=${id}`)

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('El ID proporcionado no es válido')
    }

    const user = await this.usersInscription.getInscriptionId(id)

    if (!user) {
      throw new Error('No se encontró una inscripción con ese ID')
    }

    return user
  }

  /* -------------------------------------------------------------
     📌 VALIDACIÓN CENTRALIZADA DE FORMULARIO
  ------------------------------------------------------------- */
  validateForm(body) {
    const required = [
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

    const missing = required.filter((f) => !body[f])
    if (missing.length > 0) {
      throw new Error(`Faltan campos obligatorios: ${missing.join(', ')}`)
    }

    // Documento
    if (!this.isNumeric(body.document)) {
      throw new Error('El documento debe contener solo números')
    }

    // Celular
    if (!this.isNumeric(body.cellPhone)) {
      throw new Error('El celular debe ser un número válido')
    }

    // Email
    if (!this.isEmail(body.email)) {
      throw new Error('Debe proporcionar un email válido')
    }

    // Fecha nacimiento
    const birth = new Date(body.birthDate)
    const hoy = new Date()
    if (birth > hoy) throw new Error('La fecha de nacimiento no puede ser futura')

    // Texto mínimos
    const textFields = ['name', 'lastName', 'nationality', 'address', 'locality', 'occupation']

    textFields.forEach((field) => {
      if (String(body[field]).trim().length < 2) {
        throw new Error(`El campo ${field} es demasiado corto`)
      }
    })
  }

  /* -------------------------------------------------------------
     📌 CREATE
  ------------------------------------------------------------- */
  async createNewInscription(body) {
    secureLog('📤 Service → createNewInscription (raw):', body)

    if (!body || typeof body !== 'object') {
      throw new Error('Los datos enviados no son válidos')
    }

    // Validación limpia y centralizada
    this.validateForm(body)

    // Normalizamos data
    const data = {
      ...body,
      name: body.name.trim(),
      lastName: body.lastName.trim(),
      email: body.email.trim().toLowerCase(),
      birthDate: new Date(body.birthDate),
      document: Number(body.document),
      cellPhone: Number(body.cellPhone),
      postalCode: body.postalCode ? Number(body.postalCode) : undefined,
      placeOfBirth: body.placeOfBirth?.trim()
    }

    secureLog('🔧 Service → cleanedData:', data)

    try {
      const created = await this.usersInscription.createInscription(data)
      log('✅ Inscripción creada correctamente en MongoDB')

      // -----------------------------------------------------
      // EMAIL VALIDATION (NO BLOQUEA INSCRIPCIÓN)
      // -----------------------------------------------------
      if (mailingService) {
        mailingService.createEmailValidationIncription(created.email).catch((err) => {
          logError('⚠ Error enviando email de validación (no bloquea inscripción):', err.message)
        })
      } else {
        warn('⚠ MailingService NO inyectado → No se envió email de validación')
      }

      return created
    } catch (err) {
      logError('❌ Error Mongo al crear inscripción:', err)

      if (err.code === 11000) {
        throw new Error('El email ya está registrado en el sistema')
      }

      if (err.name === 'ValidationError') {
        throw new Error(
          Object.values(err.errors)
            .map((e) => e.message)
            .join(', ')
        )
      }

      throw new Error('Error al crear la inscripción en la base de datos')
    }
  }

  /* -------------------------------------------------------------
     📌 DELETE
  ------------------------------------------------------------- */
  async deleteInscriptionById(id) {
    warn(`🗑 Service → deleteInscriptionById id=${id}`)

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('El ID proporcionado no es válido')
    }

    const exists = await this.usersInscription.getInscriptionId(id)
    if (!exists) {
      throw new Error('La inscripción no existe')
    }

    return await this.usersInscription.deleteInscription(id)
  }
}

export default UsersInscriptionService
