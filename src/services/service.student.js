import StudentsRepository from '../repositories/student.repository.js'
import CustomError from './errors/customError.js'
import EErrors from './errors/enums.js'
import { generateUserErrorInfo } from './errors/info.js'
import FileService from './service.files.js'

class StudentsService {
  constructor() {
    this.students = new StudentsRepository()
  }

  async getAllStudent() {
    try {
      const students = await this.students.getAllStudents()
      if (!students || students.length === 0) {
        throw new Error('No se han encontrado Studiantes registrados')
      } else {
        return students
      }
    } catch (error) {
      throw new Error('Se produjo un error al leer los estudiantes registrados')
    }
  }

  //retorna el usuario
  async getStudent(email) {
    try {
      if (!email) {
        console.log('error')
        CustomError.createError({
          name: 'student Creation Error',
          cause: generateUserErrorInfo({ email }),
          code: EErrors.INVALID_TYPES_ERROR,
          message: 'Error trying to create a new user'
        })
      }
      const student = await this.students.getStudent(email)
      return student
    } catch (error) {
      throw new Error('Se produjo un error al leer el E-mail ingresado')
    }
  }

  async getStudentById(id) {
    try {
      const student = await this.students.getStudentById(id)
      return student
    } catch (error) {
      throw new Error('Se produjo un error al leer el id ingresado')
    }
  }

  //crea usuario
  async createStudent(body) {
    try {
      /* if (typeof body != 'object') {
        throw new Error(
          'Se produjo un error al cargar los datos del nuevo estudiante, verifique si los campos estan correctamente completados'
        )
      } */
      /* const { firstName, lastName, dni, role } = body
      if (!firstName || !lastName || !dni || !role) {
        console.log('error')
        CustomError.createError({
          name: 'student Creation Error',
          cause: generateUserErrorInfo({
            firstName,
            lastName,
            dni,
            role
          }),
          code: EErrors.INVALID_TYPES_ERROR,
          message: 'Error trying to create a new student'
        })
      } */
      const newStudent = await this.students.createStudent(body)
      return newStudent
    } catch (error) {
      console.error('Error service', error.message, error.stack)
      throw new Error('se produjo un error al crear un estudiante nuevo', error.message)
    }
  }

  async deleteStudentById(id) {
    try {
      const studentId = id
      const student = await this.students.getStudentById(studentId)
      if (!student) {
        throw new Error('El estudiante no existe')
      } else {
        //eliminar la imagen o archivo del servidor
        const idImage = student.documents[0].gridfsId
        console.log('service-student-1', idImage)
        const image = await FileService.getFileById(idImage)
        console.log('service-student-2', image)

        // si imagen existe se elimina y si no da error y no se puede eliminar al estudiante
        if ((image.success = false)) {
          throw new Error('Archivo no encontrado en GridFS')
        } else {
          const deleteImage = await FileService.deleteFileById(idImage)
          console.log('Service-estudent-3', deleteImage)
          if ((deleteImage.success = false)) {
            throw new Error('No se pudo eliminar la imagen del estudiante')
          } else {
            const deleteStudent = await this.students.deleteStudent(studentId)
            console.log('service-student-4', deleteStudent)
            if (deleteStudent.deletedCount != 1) {
              throw new Error('No se pudo eliminar al estudiante')
            } else {
              return {
                success: true,
                deleteStudent: deleteStudent
              }
            }
          }
        }

        /* if (urlImage) {
          const deleteImage = await fs.promises.unlink(urlImage)
          if (deleteImage) {
            throw new Error('No se pudo eliminar la imagen del estudiante')
          } else {
            //eliminar el estudiante de la base de datos
            const deletedStudent = await this.students.deleteStudent(studentId)
            if (!deletedStudent) {
              throw new Error('No se pudo eliminar el estudiante')
            } else {
              return deletedStudent
            }
          }*/
      }
    } catch (error) {
      console.log(error.message)
    }
  }
}

export default StudentsService
