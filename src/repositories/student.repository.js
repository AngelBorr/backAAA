/* import DaosFactory from '../dao/factory.js'

const studentsManager = new DaosFactory() */
import StudentManagerMongo from '../dao/managers/mongo/student.mongo.js'
const students = new StudentManagerMongo()

class StudentsRepository {
  constructor() {}

  async getAllStudents() {
    const allStudents = await students.getAllStudent()
    return allStudents
  }

  //retorna el usuario
  async getStudent(email) {
    const student = await students.getStudent(email)
    return student
  }

  async getStudentById(id) {
    const student = await students.getStudentById(id)
    return student
  }

  //crea student
  async createStudent(body) {
    try {
      const newStudent = await students.createStudent(body)
      return newStudent
    } catch (error) {
      console.error('Error repository', error.message, error.stack)
      throw new Error('se produjo un error al crear un estudiante nuevo', error.message)
    }
  }

  //modificar user password
  /* async updateUser(id, newpassword) {
    const user = await users.getUserId(id)
    const updatePass = await users.updateUser(user._id, newpassword)
    return updatePass
  } */

  //agrega documentos a user(chequear si se usa)
  /* async updateDocumentsUser(id, files) {
    const updateDocument = await users.documentUpdate(id, files)
    return updateDocument
  } */

  //borra al usuario por su id
  async deleteStudent(id) {
    const deletedStudent = await students.deleteStudent(id)
    return deletedStudent
  }
}

export default StudentsRepository
