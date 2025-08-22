import fs from 'fs'

class UsersManagerFile{
    constructor(){
        this.users = []
        this.pathUsers = './assets/users.json'
    }
    
    async getAllUsers(){
        const data = await fs.promises.readFile(this.pathUsers, 'utf8');
        const users = JSON.parse(data)
        return users
    }

    async getUser(email){
        const data = await fs.promises.readFile(this.pathUsers, 'utf8');
        const dataJson = JSON.parse(data)
        const user = dataJson.find(user => user.email === email)
        return user
    }

    async getUserId(id){
        const data = await fs.promises.readFile(this.pathUsers, 'utf8');
        const dataJson = JSON.parse(data)
        const user = dataJson.find(user => user.id === id)
        return user
    }

    async generateIdUsers(){
        let id = this.pathUsers.length > 0 ? this.pathUsers[this.pathUsers.length - 1].id + 1 : 1;
        return id;
    }

    async createUser(bodyUser){
        const data = await fs.promises.readFile(this.pathUsers, 'utf8');        
        if(!data){
            await fs.promises.writeFile(this.pathUsers, '[]');
            return []
        } 
        const newUser = {
            id: this.generateIdUsers(),
            ...bodyUser
        }
        this.users.push(newUser)
        await fs.promises.writeFile(this.pathUsers, JSON.stringify(this.users), 'utf8')
        return this.users

    }

    async updateUser(id, bodyUpdate){
        const data = await fs.promises.readFile(this.pathUsers, 'utf8');
        const dataJson = JSON.parse(data)
        const user = dataJson.find(user => user.id === id)
        if(user){
            Object.assign(user, bodyUpdate)
            const updatedUsers = JSON.stringify(users, null, 2);
            await fs.promises.writeFile(this.pathUsers, updatedUsers, 'utf8')
            return user
        }else{
            return user
        }
    }

    //agrega document al usuario
    async documentUpdate(id, files){
        const data = await fs.promises.readFile(this.pathUsers, 'utf8');
        const dataJson = JSON.parse(data)
        const user = dataJson.find(user => user.id === id)
        if(user){
            const document = user.documents
            const newDocuments = [
                ...document,
                ...files.map(file => ({ name: file.originalname, reference: file.path }))
            ]
            Object.assign(user, newDocuments)
            const updatedUsers = JSON.stringify(users, null, 2);
            await fs.promises.writeFile(this.pathUsers, updatedUsers, 'utf8')
            return user
        }else{
            return user
        }

        
        return await this.userModel.updateOne(user._id, { documents: newDocuments });
    }

    //eliminamos al usuario
    async deleteUser(id){
        const data = await fs.promises.readFile(this.pathUsers, 'utf8');
        const index = data.findIndex(user => user.id === id)
        if(index !== -1){
            data.splice(index, 1)
            this.pathUsers = data
            await fs.promises.writeFile(this.pathUsers, JSON.stringify(this.pathUsers, null, 2))
            return this.pathUsers
        }else{
            return index
        }
    }

}

export default UsersManagerFile