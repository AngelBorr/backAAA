import StudentsRepository from '../repositories/student.repository.js'
import FileService from './service.files.js'

class StudentsService {
  constructor() {
    this.students = new StudentsRepository()
  }

  // ======================================================
  async getAllStudents() {
    try {
      const students = await this.students.getAllStudents()
      return { success: true, data: students }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // ======================================================
  async getStudentById(id) {
    try {
      const student = await this.students.getStudentById(id)
      return { success: true, data: student }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // ======================================================
  async addStudent(body, file) {
    try {
      // 1. Subir archivo a GridFS
      const upload = await FileService.uploadFile(file.buffer, file.originalname, {
        contentType: file.mimetype,
        studentName: body.firstName,
        studentLastName: body.lastName
      })

      if (!upload.success) {
        return { success: false, error: upload.error }
      }

      const fileId = upload.fileId.toString()
      const fileUrl = `/api/files/${fileId}`

      // 2. Crear estructura final del estudiante (documents es ARRAY)
      const studentData = {
        ...body,
        documents: [
          {
            name: file.originalname,
            reference: fileUrl,
            gridfsId: fileId,
            filename: upload.filename,
            uploadDate: new Date(),
            contentType: file.mimetype
          }
        ]
      }

      // 3. Crear estudiante
      const newStudent = await this.students.createStudent(studentData)

      return {
        success: true,
        data: {
          student: newStudent,
          file: {
            fileId,
            url: fileUrl,
            filename: upload.filename
          }
        }
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // ======================================================
  async deleteStudentById(id) {
    try {
      const student = await this.students.getStudentById(id)

      if (!student) {
        return { success: false, message: 'El estudiante no existe' }
      }

      if (!student.documents || student.documents.length === 0) {
        return { success: false, message: 'El estudiante no tiene documentos' }
      }

      const fileId = student.documents[0].gridfsId

      // 1. Eliminar archivo de GridFS
      const deletedFile = await FileService.deleteFileById(fileId)

      if (!deletedFile.success) {
        return { success: false, message: deletedFile.error }
      }

      // 2. Eliminar estudiante
      const deletedStudent = await this.students.deleteStudent(id)

      if (deletedStudent.deletedCount !== 1) {
        return { success: false, message: 'No se pudo eliminar el estudiante' }
      }

      return { success: true, message: 'Estudiante eliminado correctamente' }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }
}

export default StudentsService
