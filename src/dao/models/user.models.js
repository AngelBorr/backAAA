import mongoose, { Schema } from 'mongoose'

const userCollection = 'users'

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^\S+@\S+\.\S+$/
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: 'user',
    required: false
  }
})

const userModel = mongoose.model(userCollection, userSchema)

export default userModel
