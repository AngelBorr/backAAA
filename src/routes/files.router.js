import { getFileById, getInfoFileById, deleteFile } from '../controllers/controller.file.js'
import MyOwnRouter from './router.js'

export default class FilesRouter extends MyOwnRouter {
  init() {
    // ruta get debera traer al usuario por id
    this.get('/:id', ['public'], getFileById)

    // Obtener información del archivo (metadata)
    this.get('/info/:id', ['public'], getInfoFileById)

    // ruta delete debera eliminar el archivo por su id
    this.delete('/delete/:id', ['public'], deleteFile)
  }
}
