import studentModel from '../../models/student.models.js'

class StudentManagerMongo {
  studentModel
  constructor() {
    this.studentModel = studentModel
  }
  //trae a todos los studiantes
  async getAllStudent() {
    const students = await this.studentModel.find().lean()
    return students
  }

  //trae al student por su email
  async getStudent(email) {
    const student = await this.studentModel.findOne({ email })
    return student
  }

  //trae al student por su id
  async getStudentById(id) {
    const _id = id
    const student = await this.studentModel.findById(_id)
    return student
  }

  //crea student
  async createStudent(bodyStudent) {
    try {
      const newStudent = await this.studentModel.create(bodyStudent)
      return newStudent
    } catch (error) {
      console.error('Error manager', error.message, error.stack)
      throw new Error('se produjo un error al crear un estudiante nuevo', error.message)
    }
  }

  //modificar user password
  /* async updateStudent(id, bodyUpdate){
        const idMongoStudent = {_id:id}
        const updatePass = await this.studentModel.updateOne(idMongoStudent, bodyUpdate)
        return updatePass
    } */

  //eliminar un student
  async deleteStudent(id) {
    const deleteStudent = await this.studentModel.deleteOne({ _id: id })
    return deleteStudent
  }
}

export default StudentManagerMongo
