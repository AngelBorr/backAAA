// src/routes/inscriptions.router.js

import MyOwnRouter from './router.js'
import {
  getAllInscription,
  getInscriptionById,
  getInscription,
  addInscription,
  deleteInscriptionById
} from '../controllers/controller.inscription.js'

import { log, warn, error as logError } from '../utils/logger.js'

export default class InscriptionsRouter extends MyOwnRouter {
  init() {
    log('📌 InscriptionsRouter inicializado')

    // Obtener TODAS las inscripciones
    this.get(
      '/',
      ['ADMIN'],
      (req, res, next) => {
        log('📥 GET /api/inscriptions → obtener todas las inscripciones')
        next()
      },
      getAllInscription
    )

    // Obtener inscripción por ID
    this.get(
      '/id/:id',
      ['ADMIN'],
      (req, res, next) => {
        log(`📥 GET /api/inscriptions/id/${req.params.id}`)
        next()
      },
      getInscriptionById
    )

    // Obtener inscripción por email
    this.get(
      '/email/:email',
      ['ADMIN'],
      (req, res, next) => {
        log(`📥 GET /api/inscriptions/email/${req.params.email}`)
        next()
      },
      getInscription
    )

    // Crear inscripción (acceso público)
    this.post(
      '/add',
      ['PUBLIC'],
      (req, res, next) => {
        log('📤 POST /api/inscriptions/add → creando nueva inscripción')
        next()
      },
      addInscription
    )

    // Eliminar inscripción por ID
    this.delete(
      '/:id',
      ['ADMIN'],
      (req, res, next) => {
        warn(`🗑 DELETE /api/inscriptions/${req.params.id}`)
        next()
      },
      deleteInscriptionById
    )
  }
}
