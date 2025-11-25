// src/dao/managers/mongo/usersInscription.mongo.js
import userInscriptionModel from '../../models/userInscription.models.js'
import { log, warn, error as logError } from '../../../utils/logger.js'

class UsersInscriptionManager {
  constructor() {
    this.model = userInscriptionModel
  }

  /* -------------------------------------------------------------
     📌 GET ALL
  ------------------------------------------------------------- */
  async getAllInscription() {
    log('📥 DAO → getAllInscription')
    try {
      return await this.model.find().lean()
    } catch (error) {
      logError('❌ DAO: error en getAllInscription:', error)
      throw error
    }
  }

  /* -------------------------------------------------------------
     📌 GET BY EMAIL
  ------------------------------------------------------------- */
  async getInscription(email) {
    log(`📥 DAO → getInscription email=${email}`)
    try {
      return await this.model.findOne({ email: email.toLowerCase() }).lean()
    } catch (error) {
      logError('❌ DAO: error en getInscription:', error)
      throw error
    }
  }

  /* -------------------------------------------------------------
     📌 GET BY ID
  ------------------------------------------------------------- */
  async getInscriptionId(id) {
    log(`📥 DAO → getInscriptionId id=${id}`)
    try {
      return await this.model.findById(id).lean()
    } catch (error) {
      logError('❌ DAO: error en getInscriptionId:', error)
      throw error
    }
  }

  /* -------------------------------------------------------------
     📌 CREATE
  ------------------------------------------------------------- */
  async createInscription(body) {
    log('📤 DAO → createInscription')
    try {
      const created = await this.model.create(body)
      log('✅ DAO: inscripción creada')
      return created
    } catch (error) {
      logError('❌ DAO: error en createInscription:', error)

      // Reenviamos código RAW para que el Service pueda distinguir
      throw error
    }
  }

  /* -------------------------------------------------------------
     📌 UPDATE
  ------------------------------------------------------------- */
  async updateInscription(id, bodyUpdate) {
    log(`📤 DAO → updateInscription id=${id}`)
    try {
      const result = await this.model.updateOne({ _id: id }, bodyUpdate)
      return result.modifiedCount > 0
    } catch (error) {
      logError('❌ DAO: error en updateInscription:', error)
      throw error
    }
  }

  /* -------------------------------------------------------------
     📌 DELETE
  ------------------------------------------------------------- */
  async deleteInscription(id) {
    warn(`🗑 DAO → deleteInscription id=${id}`)
    try {
      const result = await this.model.deleteOne({ _id: id })
      return result.deletedCount > 0
    } catch (error) {
      logError('❌ DAO: error en deleteInscription:', error)
      throw error
    }
  }
}

export default UsersInscriptionManager
