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
  /* age:{
        type: Number,
        required: true,
    }, */
  password: {
    type: String,
    required: true
  },
  /* birth_date:{
        type: Date,
        required: true,
    },
    cart:{
        type: Schema.Types.ObjectId, //referencias al modelo de Carrito (Carts), en este
        ref:'Carts',
        require:false        
    },  */
  role: {
    type: String,
    default: 'user',
    required: false
  } /* ,
    documents: [{
        name: String,
        reference: String
    }],
    last_connection: {
        type: Date,
        required: false,
    } */
})

const userModel = mongoose.model(userCollection, userSchema)

export default userModel
