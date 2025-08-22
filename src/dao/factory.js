import UsersManager from './managers/mongo/users.mongo.js'
import StudentManagerMongo from './managers/mongo/student.mongo.js'
import StudentManagerFile from './managers/file/student.file.js'
import UsersManagerFile from './managers/file/users.file.js'

class DaosFactory {
  constructor() {}

  usersDao() {
    const dao = process.env.PERSISTENCE || 'mongo'
    switch (dao) {
      case 'mongo':
        return new UsersManager()
      case 'file':
        return new UsersManagerFile()
      default:
        return new UsersManager()
    }
  }

  studentsDao() {
    const dao = process.env.PERSISTENCE || 'mongo'
    switch (dao) {
      case 'mongo':
        return new StudentManagerMongo()
      case 'file':
        return new StudentManagerFile()
      default:
        return new StudentManagerMongo()
    }
  }
}

export default DaosFactory
