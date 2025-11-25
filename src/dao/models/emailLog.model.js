// src/models/emailLog.model.js
import mongoose, { Schema } from 'mongoose'

const emailLogCollection = 'emailLogs'

const EmailLogSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'usersInscription',
      required: false
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: /^\S+@\S+\.\S+$/
    },

    type: {
      type: String,
      required: true,
      enum: ['inscription_validation', 'mass_validation', 'retry_validation']
    },

    status: {
      type: String,
      enum: ['success', 'failed'],
      required: true
    },

    errorMessage: {
      type: String,
      maxlength: 500 // evita que un error SMTP gigante rompa la DB
    },

    payload: {
      type: Schema.Types.Mixed, // MUCHO mejor que Object
      required: false
    }
  },
  { timestamps: true }
)

export default mongoose.model(emailLogCollection, EmailLogSchema)
