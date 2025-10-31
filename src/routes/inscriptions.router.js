import {
  getAllInscription,
  getInscription,
  getInscriptionById,
  addInscription,
  deleteInscriptionById
} from '../controllers/controller.inscription.js'
import MyOwnRouter from './router.js'

export default class InscriptionsRouter extends MyOwnRouter {
  init() {
    // la ruta get debera traer todas las inscripciones
    this.get('/', ['public'], getAllInscription)

    // la ruta get debera traer una inscripcion por su id
    this.get('/id/:id', ['public'], getInscriptionById)

    // la ruta get debera traer una inscripcion por su email
    this.get('/email/:email', ['public'], getInscription)

    // la ruta post  debera crear una nueva inscripcion
    this.post('/', ['public'], addInscription)

    // la ruta delete debera eliminar una inscripcion por su id
    this.delete('/:id', ['public'], deleteInscriptionById)
  }
}
