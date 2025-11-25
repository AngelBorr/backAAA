import mongoose, { Schema } from 'mongoose'

const emailLogCollection = 'emailLogs'

const EmailLogSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'usersInscription', required: true },
    email: { type: String, required: true },
    type: { type: String, required: true }, // ej: "inscription_validation"
    status: { type: String, enum: ['success', 'failed'], required: true },
    errorMessage: { type: String },
    payload: { type: Object } // opcional: lo enviado
  },
  { timestamps: true }
)

export default mongoose.model(emailLogCollection, EmailLogSchema)
