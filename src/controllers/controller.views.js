import CustomError from '../services/errors/customError.js'
import { generateProductsMockingErrorInfo } from '../services/errors/info.js'
import EErrors from '../services/errors/enums.js'
import UsersService from '../services/service.users.js'

const userService = new UsersService()

//configuracion vistas publicas y privadas
export const publicAccess = async (req, res, next) => {
  if (req.session.user) return res.redirect('/products')
  req.logger.info(req.session.user)
  next()
}

export const privateAccess = async (req, res, next) => {
  if (!req.session.user) return res.redirect('/login')
  req.logger.error(!req.session.user)
  next()
}

//vista products contiene lista de productos
export const getViewProducts = async (req, res) => {
  try {
    const { limit = 5, page = 1, sort = 'asc', category } = req.query
    const data = await productsService.getProducts(limit, page, sort, category)
    let products = data.products
    if (!data) {
      req.logger.fatal('El valor de data es: ' + data + ', en ControllersView')
      return res.status(404).render('El listado de productos esta vacio.')
    } else {
      res.status(200).render('products', {
        products: products,
        user: req.session.user,
        style: 'index.css',
        styleBoostrap: 'bootstrap.min.css',
        title: 'ProductsList',
        hasPrevPage: data.hasPrevPage,
        hasNextPage: data.hasNextPage,
        prevPage: data.prevPage,
        nextPage: data.nextPage
      })
    }
  } catch (error) {
    req.logger.error('Se produjo un error en ControllerView y no se renderizan los Productos')
    return res.status(500).render('Error al obtener los producto desde products.json')
  }
}

//vista cart contiene la lista del carrito
export const getViewCartById = async (req, res) => {
  try {
    const idCart = req.params.cid
    req.logger.debug('El id del carrito es: ' + idCart)
    const cart = await cartsService.getCartById(idCart)
    if (!cart) {
      req.logger.warn('El carrito con el id ' + idCart + ' no existe')
      return res.status(404).render('El carrito esta vacio.')
    } else {
      req.logger.info('El carrito con el id ' + idCart + ' se ha obtenido correctamente')
      res.status(200).render('cart', {
        cart: cart,
        style: 'index.css',
        styleBoostrap: 'bootstrap.min.css',
        title: 'CartList'
      })
    }
  } catch (error) {
    req.logger.error('Se ha producido un error en la función getViewCartById: ' + error)
    return res.status(500).render('Error al obtener los producto desde products.json')
  }
}

//vista formulario agregar products
export const getViewFormularyProducts = async (req, res) => {
  try {
    res.status(200).render('formAddProducts', {
      style: 'index.css',
      styleBoostrap: 'bootstrap.min.css',
      title: 'formAddProducts'
    })
  } catch (error) {
    req.logger.error('Se produjo un error al renderizar ViewFomularyProducts')
    return res.status(500).render('Error al obtener los producto desde products.json')
  }
}

//vista handlebars con socket muestra planilla products
export const getViewHandlebarsProducts = async (req, res) => {
  try {
    res.status(200).render('realTimeProducts', {
      style: 'index.css',
      styleBoostrap: 'bootstrap.min.css',
      title: 'realTimeProducts'
    })
  } catch (error) {
    req.logger.error('Se produjo un error al renderizar ViewRealTimeProducts')
    return res.status(500).render('Error al obtener los producto desde products.json')
  }
}

//vista chat
export const getViewChat = (req, res) => {
  try {
    res.status(200).render('chat')
  } catch (error) {
    req.logger.error('Se produjo un error al renderizar ViewChat')
    return res.status(500).render('Error al obtener los messages desde la base de datos')
  }
}

//vista registro usuarios
export const getViewRegisterUser = async (req, res) => {
  try {
    res.status(200).render('registerUser', {
      style: 'index.css',
      /* styleBoostrap: 'bootstrap.min.css', */
      title: 'RegisterUser'
    })
  } catch (error) {
    req.logger.error('Se produjo un error al renderizar ViewRegisterUser')
    return res.status(500).render('Error al renderizar el resgistro de usuarios')
  }
}

//vista login
export const getViewLoginUser = async (req, res) => {
  try {
    res.status(200).render('loginUser', {
      style: 'index.css',
      styleBoostrap: 'bootstrap.min.css',
      title: 'loginUser',
      imgSrc: '/img/github.png'
    })
  } catch (error) {
    req.logger.error('Se produjo un error al renderizar ViewLoginUser')
    return res.status(500).render('Error al renderizar el login')
  }
}

//vista resetPassword
export const getViewResetPass = async (req, res) => {
  try {
    res.status(200).render('resetPassword', {
      style: 'index.css',
      styleBoostrap: 'bootstrap.min.css',
      title: 'resetPassword'
    })
  } catch (error) {
    req.logger.error('Se produjo un error al renderizar ViewResetPassword')
    return res.status(500).render('Error al renderizar resetPassword')
  }
}

export const getViewRestartPass = async (req, res) => {
  try {
    res.status(200).render('restartPassword', {
      style: 'index.css',
      styleBoostrap: 'bootstrap.min.css',
      title: 'restartPassword'
    })
  } catch (error) {
    req.logger.error('Se produjo un error al renderizar ViewRestartPassword')
    return res.status(500).render('Error al renderizar restartPassword')
  }
}

//vista current
export const getViewCurrent = async (req, res) => {
  try {
    res.status(200).render('current', {
      style: '',
      styleBoostrap: '',
      title: 'current'
    })
  } catch (error) {
    req.logger.error('Se produjo un error al renderizar ViewCurrent')
    return res.status(500).render('Error al renderizar resetPassword')
  }
}

//vista Moking
export const getViewMocking = async (req, res) => {
  try {
    let products = []
    for (let i = 0; i < 100; i++) {
      const item = generateProduct()
      const { title, price, category, stock, thumbnail, _id, code, description } = item
      if (!title || !price || !category || !stock || !thumbnail || !_id || !code || !description) {
        CustomError.createError({
          name: 'Products Creation Error',
          cause: generateProductsMockingErrorInfo({
            title,
            price,
            category,
            stock,
            thumbnail,
            _id,
            code,
            description
          }),
          code: EErrors.INVALID_TYPES_ERROR,
          message: 'Error trying to create a new Products'
        })
        req.logger.error('Se produjo un error al crear el producto en Mocking')
      }
      products.push(item)
    }
    if (!products) {
      req.logger.fatal('No se pudo acceder a products en ViewMocking')
      return res.status(404).render('El listado de productos esta vacio.')
    } else {
      res.status(200).render('products', {
        products: products,
        style: 'index.css',
        styleBoostrap: 'bootstrap.min.css',
        title: 'ProductsListMocking'
      })
    }
  } catch (error) {
    req.logger.error('Se produjo un error al renderizar ViewMocking: ' + error.cause)
    return res.status(500).render('Error al obtener los producto desde faker')
  }
}

//vista Premium/:id
export const getViewPremiumRole = async (req, res) => {
  try {
    res.status(200).render('premiumUpdateRole', {
      style: 'index.css',
      styleBoostrap: 'bootstrap.min.css',
      title: 'Update Role'
    })
  } catch (error) {
    req.logger.error('Se produjo un error al renderizar PremiumRole')
    return res.status(500).render('Error al renderizar PremiumRole')
  }
}

export const getViewUsers = async (req, res) => {
  try {
    res.status(200).render('usersList', {
      style: 'index.css',
      //styleBoostrap: 'bootstrap.min.css',
      title: 'Users List'
      //users: users
    })
    /* const users = await userService.getAllUsers()
    if (!users) {
      req.logger.fatal('No hay usuarios para mostrar')
      return res.status(404).render('El listado de usuarios esta vacio.')
    } else {
      //antes de rendizar users verifica si hay usuarios cuya conexion tiene una diferencia de 48hs los elimine
      for (let i = 0; i < users.length; i++) {
        if (
          users[i].last_connection === undefined ||
          (users[i].last_connection && new Date() - new Date(users[i].last_connection) > 172800000)
        ) {
          await userService.deleteUserById(users[i]._id)
        }
        res.status(200).render('usersList', {
          style: 'index.css',
          styleBoostrap: 'bootstrap.min.css',
          title: 'Users List',
          users: users
        })
      }
    } */
  } catch (error) {
    req.logger.error('Se produjo un error al renderizar UsersList')
    return res.status(500).render('Error al renderizar UsersList')
  }
}

export const getViewAdminProducts = async (req, res) => {
  try {
    const { limit = 5, page = 1, sort = 'asc', category } = req.query
    const data = await productsService.getProducts(limit, page, sort, category)
    let products = data.products
    if (!data) {
      req.logger.fatal('El valor de data es: ' + data + ', en ControllersView')
      return res.status(404).render('El listado de productos esta vacio.')
    } else {
      res.status(200).render('adminProducts', {
        products: products,
        style: 'index.css',
        styleBoostrap: 'bootstrap.min.css',
        title: 'ProductsList',
        hasPrevPage: data.hasPrevPage,
        hasNextPage: data.hasNextPage,
        prevPage: data.prevPage,
        nextPage: data.nextPage
      })
    }
  } catch (error) {
    req.logger.error('Se produjo un error en ControllerView y no se renderizan los Productos')
    return res.status(500).render('Error al obtener los producto desde products.json')
  }
}
