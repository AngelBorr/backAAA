import mongoose, { Schema } from 'mongoose'

const inscriptionCollection = 'usersInscription'

const userInscription = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  document: {
    type: Number,
    required: true
  },
  nationality: {
    type: String,
    required: true
  },
  birthDate: {
    type: Date,
    required: true
  },
  placeOfBirth: {
    type: String,
    required: false
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^\S+@\S+\.\S+$/
  },
  cellPhone: {
    type: Number,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  postalCode: {
    type: Number,
    required: false
  },
  province: {
    type: String,
    required: true
  },
  locality: {
    type: String,
    required: true
  },
  occupation: {
    type: String,
    required: true
  },
  studies: {
    type: String,
    required: true
  },
  sportBackground: {
    type: String,
    required: true
  }
})

const userInscriptionModel = mongoose.model(inscriptionCollection, userInscription)

export default userInscriptionModel
