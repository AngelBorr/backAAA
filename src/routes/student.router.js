import {
  addStudent,
  deleteStudent,
  getStudentById,
  getStudents,
  getStudentByIdPublic
} from '../controllers/controller.student.js'
import { uploader } from '../utils.js'
import MyOwnRouter from './router.js'

export default class StudentRouter extends MyOwnRouter {
  init() {
    // la ruta put debera actualizar el rol del usuario
    //this.put('/premium/:id', ['ADMIN'], updateRole)

    // la ruta post  recibe los documentos y los agrega al usuario
    this.post('/addStudent', ['ADMIN'], uploader.single('alumnos'), addStudent)

    // la ruta post  recibe los documentos y los datos de alunmos y los agrega a base de datos
    //this.post('/addStudent', ['public'], uploader.array('alumnos'), addStudent)

    // ruta get debera traer a todos los usuarios
    this.get('/', ['ADMIN'], getStudents)

    // ruta get debera traer al usuario por id
    this.get('/:id', ['ADMIN'], getStudentById)

    // ruta delete debera eliminar a un usuario por su id
    this.delete('/delete/:id', ['ADMIN'], deleteStudent)

    //ruta publica para las credenciales de los estudiantes
    this.get('/public/:id', ['PUBLIC'], getStudentByIdPublic)
  }
}
