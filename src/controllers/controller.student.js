import StudentService from '../services/service.student.js'
import __dirname from '../utils.js'

const studentService = new StudentService()

//trae a todos los usuarios
export const getStudents = async (req, res) => {
  try {
    //req.logger.info('Se solicitan a todos los estudiantes')
    const students = await studentService.getAllStudent()
    return res
      .status(200)
      .send({ status: 'success', message: 'Estudiantes obtenidos', payload: students })
  } catch (error) {
    req.logger.fatal(
      `Se produjo un error al intentar obtener a todos los estudiantes, ${error.message}`
    )
    return res
      .status(500)
      .send(`Se produjo un error al intentar obtener a todos los estudiantes, ${error.message}`)
  }
}

//elimina al usuario por su id
export const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params
    const studentDelete = await studentService.deleteStudentById(id)
    if (studentDelete.deletedCount === 1) {
      return res.status(200).send('Usuario eliminado exitosamente')
    } else {
      return res.status(400).send('No se pudo eliminar el usuario')
    }
  } catch (error) {
    req.logger.fatal(
      `Se produjo un error al intentar borrar al usuario solicitado, ${error.message}`
    )
    return res
      .status(500)
      .send(`Se produjo un error al intentar borrar al usuario solicitado, ${error.message}`)
  }
}

//agrega a los alumnos a la base de datos con sus documentos
export const addStudent = async (req, res) => {
  try {
    const body = req.body
    const file = req.file
    if (!file) {
      return res.status(400).send('No se ha cargado el archivo, intente nuevamente')
    } else {
      body.documents = {
        name: file.originalname,
        reference: file.path
      }

      const clonBody = { ...body }
      const newStudent = await studentService.createStudent(clonBody)
      if (!newStudent) {
        return res
          .status(400)
          .send({ status: 'Error', error: 'No se pudo crear el alumno', console: Error.arguments })
      } else {
        return res
          .status(200)
          .send({ status: 'success', message: 'Alumno registrado', payload: newStudent })
      }
    }
  } catch (error) {
    console.error('Error controller', error.message, error.stack)
    req.logger.fatal(
      `Se produjo un error al que obtener los documentos para insertarlos en el usuario, ${error.message}`
    )
    return res
      .status(500)
      .send(
        `Se produjo un error al que obtener los documentos para insertarlos en el usuario, ${error.message}`
      )
  }
}

//trae al usuario por su id
export const getStudentById = async (req, res) => {
  try {
    const { id } = req.params
    const student = await studentService.getStudentById(id)
    if (!student) {
      return res.status(400).send('El estudiante no existe')
    } else {
      return res
        .status(200)
        .send({ status: 'success', message: 'Estudiante obtenido', payload: student })
    }
  } catch (error) {
    req.logger.fatal(
      `Se produjo un error al intentar obtener al estudiante solicitado, ${error.message}`
    )
    return res
      .status(500)
      .send(`Se produjo un error al intentar obtener al estudiante solicitado, ${error.message}`)
  }
}
