import userInscriptionModel from '../../models/userInscription.models.js'
import mongoose from 'mongoose'

class UsersInscriptionManager {
  constructor() {
    this.model = userInscriptionModel
  }

  async getAllInscription() {
    try {
      return await this.model.find().lean()
    } catch (error) {
      console.error('Error en getAllInscription (DAO):', error)
      throw new Error('Error al obtener las inscripciones desde la base de datos')
    }
  }

  async getInscription(email) {
    try {
      return await this.model.findOne({ email }).lean()
    } catch (error) {
      console.error('Error en getInscription (DAO):', error)
      throw new Error('Error al obtener la inscripción por email')
    }
  }

  async getInscriptionId(id) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) return null
      return await this.model.findById(id).lean()
    } catch (error) {
      console.error('Error en getInscriptionId (DAO):', error)
      throw new Error('Error al obtener la inscripción por ID')
    }
  }

  async createInscription(body) {
    try {
      return await this.model.create(body)
    } catch (error) {
      console.error('Error en createInscription (DAO):', error)
      throw new Error('Error al crear la inscripción en la base de datos')
    }
  }

  async updateInscription(id, bodyUpdate) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) return null

      const result = await this.model.updateOne({ _id: id }, bodyUpdate)
      return result.modifiedCount > 0 ? result : null
    } catch (error) {
      console.error('Error en updateInscription (DAO):', error)
      throw new Error('Error al actualizar la inscripción')
    }
  }

  async deleteInscription(id) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) return null

      const result = await this.model.deleteOne({ _id: id })
      return result.deletedCount > 0
    } catch (error) {
      console.error('Error en deleteInscription (DAO):', error)
      throw new Error('Error al eliminar la inscripción')
    }
  }
}

export default UsersInscriptionManager
