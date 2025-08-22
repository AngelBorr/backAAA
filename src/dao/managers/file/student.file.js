import fs from 'fs'

class StudentManagerFile {
  constructor() {
    this.students = []
    this.pathStudents = './assets/students.json'
  }

  async getAllStudent() {
    const data = await fs.promises.readFile(this.pathStudents, 'utf8')
    const students = JSON.parse(data)
    return students
  }

  async getStudent(email) {
    const data = await fs.promises.readFile(this.pathStudents, 'utf8')
    const dataJson = JSON.parse(data)
    const student = dataJson.find((stud) => stud.email === email)
    return student
  }

  async getStudentById(id) {
    const data = await fs.promises.readFile(this.pathStudents, 'utf8')
    const dataJson = JSON.parse(data)
    const student = dataJson.find((stud) => stud.id === id)
    return student
  }

  async generateIdStudent() {
    let id =
      this.pathStudents.length > 0 ? this.pathStudents[this.pathStudents.length - 1].id + 1 : 1
    return id
  }

  async createStudent(bodyUser) {
    const data = await fs.promises.readFile(this.pathStudents, 'utf8')
    if (!data) {
      await fs.promises.writeFile(this.pathStudents, '[]')
      return []
    }
    const newStudent = {
      id: this.generateIdStudent(),
      ...bodyUser
    }
    this.students.push(newStudent)
    await fs.promises.writeFile(this.pathStudents, JSON.stringify(this.students), 'utf8')
    return this.students
  }

  async updateStudent(id, bodyUpdate) {
    const data = await fs.promises.readFile(this.pathStudents, 'utf8')
    const dataJson = JSON.parse(data)
    const student = dataJson.find((stud) => stud.id === id)
    if (student) {
      Object.assign(student, bodyUpdate)
      const updatedStudents = JSON.stringify(students, null, 2)
      await fs.promises.writeFile(this.pathStudents, updatedStudents, 'utf8')
      return student
    } else {
      return student
    }
  }

  //agrega document al usuario
  async documentUpdate(id, files) {
    const data = await fs.promises.readFile(this.pathStudents, 'utf8')
    const dataJson = JSON.parse(data)
    const student = dataJson.find((stud) => stud.id === id)
    if (student) {
      const document = student.documents
      const newDocuments = [
        ...document,
        ...files.map((file) => ({ name: file.originalname, reference: file.path }))
      ]
      Object.assign(student, newDocuments)
      const updatedStudent = JSON.stringify(students, null, 2)
      await fs.promises.writeFile(this.pathStudents, updatedStudent, 'utf8')
      return student
    } else {
      return student
    }
  }

  //eliminamos al usuario
  async deleteStudent(id) {
    const data = await fs.promises.readFile(this.pathStudents, 'utf8')
    const index = data.findIndex((stud) => stud.id === id)
    if (index !== -1) {
      data.splice(index, 1)
      this.pathStudents = data
      await fs.promises.writeFile(this.pathStudents, JSON.stringify(this.pathStudents, null, 2))
      return this.pathStudents
    } else {
      return index
    }
  }
}

export default StudentManagerFile
