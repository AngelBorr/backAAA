import mongoose, { Schema } from 'mongoose'

const alumnosCollection = 'Alumnos'

const alumnosSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  dni: {
    type: String,
    required: true,
    unique: true
  },
  role: {
    type: String,
    default: 'alumno 1ª',
    required: true
  },
  documents: [
    {
      name: String,
      reference: String
    }
  ]
})

const studentModel = mongoose.model(alumnosCollection, alumnosSchema)

export default studentModel
