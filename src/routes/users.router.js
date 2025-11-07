import {
  addDocumentsToUser,
  updateRole,
  getUsers,
  deleteUser,
  registerUser
} from '../controllers/controller.users.js'
import { uploader } from '../utils.js'
import MyOwnRouter from './router.js'

export default class UsersRouter extends MyOwnRouter {
  init() {
    // la ruta post para el registerUser
    this.post('/register', ['ADMIN'], registerUser)

    // la ruta put debera actualizar el rol del usuario
    this.put('/premium/:id', ['ADMIN'], updateRole)

    // la ruta post  recibe los documentos y los agrega al usuario
    this.post('/:uid/documents', ['ADMIN'], uploader.array('profiles'), addDocumentsToUser)

    // la ruta post  recibe los documentos y los datos de alunmos y los agrega a base de datos
    //this.post('/addStudent', ['public'], uploader.array('alumnos'), addStudent)

    // ruta get debera traer a todos los usuarios
    this.get('/', ['public', 'ADMIN'], getUsers)

    // ruta delete debera eliminar a un usuario por su id
    this.delete('/:id', ['ADMIN'], deleteUser)
  }
}
