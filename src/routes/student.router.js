import {
  addStudent,
  deleteStudent,
  getStudentById,
  getStudents
} from '../controllers/controller.student.js'
import { uploader } from '../utils.js'
import MyOwnRouter from './router.js'

export default class StudentRouter extends MyOwnRouter {
  init() {
    // la ruta put debera actualizar el rol del usuario
    //this.put('/premium/:id', ['ADMIN'], updateRole)

    // la ruta post  recibe los documentos y los agrega al usuario
    this.post('/addStudent', ['public'], uploader.single('alumnos'), addStudent)

    // la ruta post  recibe los documentos y los datos de alunmos y los agrega a base de datos
    //this.post('/addStudent', ['public'], uploader.array('alumnos'), addStudent)

    // ruta get debera traer a todos los usuarios
    this.get('/', ['public'], getStudents)

    // ruta get debera traer al usuario por id
    this.get('/:id', ['public'], getStudentById)

    // ruta delete debera eliminar a un usuario por su id
    this.delete('/delete/:id', ['public'], deleteStudent)
  }
}
