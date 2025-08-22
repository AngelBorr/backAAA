import userModel from "../../models/user.models.js";

class UsersManager{
    userModel;
    constructor(){
        this.userModel = userModel
    }
    //trae a todos los usuarios
    async getAllUsers(){
        const users = await this.userModel.find().lean() 
        return users
    }

    //trae al usuario por su email
    async getUser(email){
        const user = await this.userModel.findOne({email})
        return user
    }

    //trae al usuario por su id
    async getUserId(id){
        const user = await this.userModel.findById({_id:id})
        return user
    }

    //crea al usuario
    async createUser(bodyUser){
        const user = await this.userModel.create(bodyUser)
        return user
    }

    //modificar user password
    async updateUser(id, bodyUpdate){
        const idMongoUser = {_id:id}
        const updatePass = await this.userModel.updateOne(idMongoUser, bodyUpdate)
        return updatePass
    }
    
    //eliminar un usuario
    async deleteUser(id){
        const delUser =  await this.userModel.deleteOne({_id:id})
        return delUser
    }
}

export default UsersManager