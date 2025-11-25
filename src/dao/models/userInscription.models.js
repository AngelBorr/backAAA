import mongoose from 'mongoose'

const inscriptionCollection = 'usersInscription'

const userInscriptionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true
    },
    lastName: {
      type: String,
      required: [true, 'El apellido es obligatorio'],
      trim: true
    },
    document: {
      type: Number,
      required: [true, 'El documento es obligatorio'],
      min: [1, 'El documento debe ser un número positivo']
    },
    nationality: {
      type: String,
      required: [true, 'La nacionalidad es obligatoria'],
      trim: true
    },
    birthDate: {
      type: Date,
      required: [true, 'La fecha de nacimiento es obligatoria']
    },
    placeOfBirth: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      required: [true, 'El email es obligatorio'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Formato de email inválido']
    },
    cellPhone: {
      type: Number,
      required: [true, 'El celular es obligatorio'],
      min: [1, 'El celular debe ser un número positivo']
    },
    address: {
      type: String,
      required: [true, 'La dirección es obligatoria'],
      trim: true
    },
    postalCode: {
      type: Number
    },
    province: {
      type: String,
      required: [true, 'La provincia es obligatoria'],
      trim: true
    },
    locality: {
      type: String,
      required: [true, 'La localidad es obligatoria'],
      trim: true
    },
    occupation: {
      type: String,
      required: [true, 'La ocupación es obligatoria'],
      trim: true
    },
    studies: {
      type: String,
      required: [true, 'Los estudios son obligatorios'],
      trim: true
    },
    sportBackground: {
      type: String,
      required: [true, 'Los antecedentes deportivos son obligatorios'],
      trim: true
    }
  },
  {
    timestamps: true
  }
)

// Índice único seguro
userInscriptionSchema.index({ email: 1 }, { unique: true })

const userInscriptionModel = mongoose.model(inscriptionCollection, userInscriptionSchema)

export default userInscriptionModel
