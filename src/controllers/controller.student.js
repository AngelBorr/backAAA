import StudentService from '../services/service.student.js'
import mongoose from 'mongoose'

const studentService = new StudentService()

// Función para subir archivo a GridFS manualmente
const uploadToGridFS = (gfsBucket, file, metadata) => {
  return new Promise((resolve, reject) => {
    try {
      const filename = `${Date.now()}-${file.originalname}`
      const uploadStream = gfsBucket.openUploadStream(filename, {
        metadata: {
          ...metadata,
          originalName: file.originalname,
          uploadDate: new Date(),
          contentType: file.mimetype
        }
      })

      // Manejar eventos del stream
      uploadStream.on('finish', () => {
        resolve({
          success: true,
          fileId: uploadStream.id,
          filename: filename
        })
      })

      uploadStream.on('error', (error) => {
        reject({
          success: false,
          error: error
        })
      })

      // Escribir el buffer y finalizar
      uploadStream.write(file.buffer)
      uploadStream.end()
    } catch (error) {
      reject({
        success: false,
        error: error
      })
    }
  })
}

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
    console.log('controller-student-1', id)
    const studentDelete = await studentService.deleteStudentById(id)
    if (studentDelete.deleteStudent.deletedCount === 1) {
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

//modificado funciona
export const addStudent = async (req, res) => {
  let fileId = null

  try {
    const body = req.body
    const file = req.file

    if (!file) {
      return res.status(400).json({
        status: 'error',
        message: 'No se ha cargado ningún archivo'
      })
    }

    // 1. Subir archivo a GridFS
    const uploadResult = await uploadToGridFS(req.gfsBucket, file, {
      role: body.role || 'tercero',
      studentName: body.name,
      studentEmail: body.email
    })

    if (!uploadResult.success) {
      throw new Error(`Error subiendo archivo: ${uploadResult.error.message}`)
    }

    fileId = uploadResult.fileId
    const fileUrl = `/api/files/${fileId}`

    // 2. Preparar datos del estudiante
    const studentData = {
      ...body,
      documents: {
        name: file.originalname,
        reference: fileUrl,
        gridfsId: fileId.toString(),
        filename: uploadResult.filename,
        uploadDate: new Date(),
        contentType: file.mimetype
      }
    }

    // 3. Crear estudiante en la base de datos
    const newStudent = await studentService.createStudent(studentData)

    if (!newStudent) {
      throw new Error('No se pudo crear el estudiante en la base de datos')
    }

    // 4. Éxito - retornar respuesta
    return res.status(200).json({
      status: 'success',
      message: 'Estudiante registrado correctamente',
      payload: {
        student: newStudent,
        file: {
          id: fileId.toString(),
          url: fileUrl,
          filename: uploadResult.filename
        }
      }
    })
  } catch (error) {
    console.error('Error en addStudent:', error.message)

    // Limpieza: eliminar archivo si se subió pero falló después
    if (fileId) {
      try {
        await req.gfsBucket.delete(new mongoose.Types.ObjectId(fileId))
        console.log('Archivo huérfano eliminado:', fileId)
      } catch (deleteError) {
        console.error('Error eliminando archivo huérfano:', deleteError.message)
      }
    }

    return res.status(500).json({
      status: 'error',
      message: 'Error al procesar el estudiante',
      error: error.message
    })
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

// ↓↓↓ NUEVO MÉTODO PARA OBTENER ARCHIVO ↓↓↓
export const getStudentFile = async (req, res) => {
  try {
    const { studentId } = req.params
    const student = await studentService.getStudentById(studentId)

    if (!student || !student.documents || !student.documents.gridfsId) {
      return res.status(404).json({ error: 'Archivo no encontrado para este estudiante' })
    }

    const fileId = student.documents.gridfsId
    const files = await req.gfsBucket.find({ _id: new mongoose.Types.ObjectId(fileId) }).toArray()

    if (!files || files.length === 0) {
      return res.status(404).json({ error: 'Archivo no encontrado' })
    }

    const file = files[0]
    res.set('Content-Type', file.metadata?.contentType || 'application/octet-stream')
    res.set('Content-Disposition', `inline; filename="${file.filename}"`)

    const downloadStream = req.gfsBucket.openDownloadStream(new mongoose.Types.ObjectId(fileId))
    downloadStream.pipe(res)
  } catch (error) {
    console.error('Error obteniendo archivo del estudiante:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}
