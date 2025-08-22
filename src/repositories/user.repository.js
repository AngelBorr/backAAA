import DaosFactory from "../dao/factory.js";

const userManager = new DaosFactory
const users = userManager.usersDao()

class UsersRepository{    
    constructor(){}

    async getAllUsers(){
        const allUsers = await users.getAllUsers()
        return allUsers;
    }

    //retorna el usuario
    async getUsers(email){        
        const user = await users.getUser(email)
        return user
    }

    async getUserById(id){
        const user = await users.getUserId(id)
        return user
    }

    //crea usuario
    async createUser(bodyUser){        
        const user = await users.createUser(bodyUser)
        return user
    }

    //modificar user password
    async updateUser(id, newpassword){
        const user = await users.getUserId(id);        
        const updatePass = await users.updateUser(user._id, newpassword)
        return updatePass
    }

    //agrega documentos a user(chequear si se usa)
    async updateDocumentsUser(id, files){
        const updateDocument = await users.documentUpdate(id, files)
        return updateDocument
    }

    //borra al usuario por su id
    async deleteUser(id){
        const deletedUser = await users.deleteUser(id)
        return deletedUser
    }
}

export default UsersRepository