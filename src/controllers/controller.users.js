import UsersService from '../services/service.users.js'
import UserDTO from '../dto/user.dto.js'
import {
  generateDiferentPassError,
  generateResetPassErrorInfo,
  generateUserErrorInfo
} from '../services/errors/info.js'
import EErrors from '../services/errors/enums.js'
import CustomError from '../services/errors/customError.js'

/* import { PRIVATE_KEY, generateToken, transport } from "../utils.js";
import jwt from 'jsonwebtoken' */

const usersService = new UsersService()

/* export const registerUser = async (req, res) => {
  //req.logger.info('El usuario se creo correctamente')
  const bodyUser = req.body
  const user = await usersService.createUser(bodyUser)
  if (!user) {
    //req.logger.error('No se pudo crear el usuario, verifique los datos ingresados')
    return res.status(400).send({ status: 'Error', error: 'No se pudo crear el usuario' })
  } else {
    //req.logger.info('Usuario creado correctamente: ' + user)
    return res
      .status(200)
      .send({ status: 'success', message: 'Usuario registrado', payload: req.user })
  }
} */

export const registerUser = async (req, res) => {
  //req.logger.info('El usuario se creo correctamente')
  return res
    .status(200)
    .send({ status: 'success', message: 'Usuario registrado', payload: req.user })
}

export const failRegister = async (req, res) => {
  req.logger.error('Fallo en la Estrategia')
  res.status(404).send({ error: 'Fallo' })
}

export const loginUser = async (req, res) => {
  if (!req.user) {
    const { firstName, lastName, email, password, role } = req.user
    if (!firstName || !lastName || !email || !password || !role) {
      //req.logger.error('Se producjo un error al verificar el usuario, credenciales invalidas')
      CustomError.createError({
        name: 'User Creation Error',
        cause: generateUserErrorInfo({
          firstName,
          lastName,
          email,
          age,
          password,
          birth_date,
          role
        }),
        code: EErrors.INVALID_TYPES_ERROR,
        message: 'Error in the credentials User'
      })
    }
    //req.logger.fatal('Las credenciales ingresados son invalidas')
    return res.status(400).send({ status: 'Error', error: 'Credenciales Invalidas' })
  }
  console.log('Login Strategy', req.user)
  req.session.user = {
    name: `${req.user.firstName} ${req.user.lastName}`,
    email: req.user.email,
    age: req.user.age,
    role: req.user.role
  }
  //req.logger.info('Session Iniciada, usuario: ' + req.user)
  return res
    .cookie('cookieToken', req.authInfo, { httpOnly: true })
    .send({ status: 'usuario autenticado', message: 'cookie set', payload: req.authInfo })
}

export const failLogin = async (req, res) => {
  req.logger.error('Fallo al Logearse, credenciales invalidas')
  res.send({ error: 'Fallo al Logearse' })
}

export const logoutSession = async (req, res) => {
  try {
    req.session.destroy((error) => {
      if (!error) {
        req.logger.info('Session Finalizada' + req.user)
        res.status(200).send('Session eliminada')
      } else {
        req.logger.error('Se produjo un error al eliminar la session')
        res.status(400).send({ status: 'Error al eliminar la session', body: error })
      }
    })
  } catch (error) {
    req.logger.error('Se produjo un error al Obtener los datos para la finalizacion de la Session')
    return res
      .status(500)
      .json('Se produjo un error al que obtener los datos para eliminar la session', error.message)
  }
}

export const resetPassword = async (req, res) => {
  try {
    const { token, newpassword, confirmNewPassword } = req.body
    if (!token || !newpassword || !confirmNewPassword) {
      req.logger.error(
        'Se produjo un error al verificar las credenciales verifique y vuelva a intentarlo'
      )
      CustomError.createError({
        name: 'User ResetPass Creation Error',
        cause: generateResetPassErrorInfo({ token, newpassword, confirmNewPassword }),
        code: EErrors.INVALID_TYPES_ERROR,
        message: 'Error in the credentials User Verify only'
      })
      return res
        .status(400)
        .send('Se produjo un error al verificar los datos ingresados, vuelva a intentarlo')
    }
    if (newpassword !== confirmNewPassword) {
      console.log('newPass distinta que confirm')
      req.logger.error(
        'Se produjo un error al verificar las nuevas credenciales, vuelva a intentarlo'
      )
      CustomError.createError({
        name: 'User diferent Pass Creation Error',
        cause: generateDiferentPassError({ newpassword, confirmNewPassword }),
        code: EErrors.INVALID_TYPES_ERROR,
        message: 'Error diferent credentials, Verify only'
      })
      return res
        .status(400)
        .send('Se produjo un error al verificar las nuevas credenciales, vuelva a intentarlo')
    }
    const user = jwt.verify(token, PRIVATE_KEY)
    if (!user) {
      req.logger.error('Usuario incorrectos y/o inexistente')
      return res.status(400).send('Usuario incorrectos y/o inexistente')
    }
    const email = user.email
    req.logger.debug(`Se solicita cambio de pass del usuario: ${email}`)
    const result = await usersService.updateUser(email, newpassword)
    if (result) res.status(200).send('contraseña restaurada exitosamente')
  } catch (error) {
    req.logger.fatal(error)
    return res
      .status(500)
      .send(
        `Se produjo un error al que obtener los datos para restaurar la contraseña, ${error.message}`
      )
  }
}

/* export const restartPassword = async (req, res) => {
    try {
        const {email} = req.body
        req.logger.debug(email)
        const user = await usersService.getUsers(email)
        req.logger.debug(user)
        if(user){
            const sendMail = await mailingService.createEmail(email)
            if(sendMail){
                req.logger.info('El mail fue enviado')
                return res.status(200).send('se realizo exitosamente el envio del Email')
            } 
        }else{
            res.status(400).send(`Usuario no valido para el email: ${email}`)
        }
    } catch (error) {
        return res.status(500).send(`Se produjo un error al que obtener los datos para restaurar la contraseña, ${error.message}`)
    }
    
} */

//current
export const usersCurrent = async (req, res, next) => {
  const user = new UserDTO(req.user)
  res.send(user)
}

//update role user
export const updateRole = async (req, res) => {
  try {
    const userId = req.params
    const id = userId.id
    req.logger.debug(`Se solicita cambiar el role del usuario con el id: ${id}`)
    const updateRole = req.body
    const updateUser = await usersService.updateRole(id, updateRole)
    if (updateRole) {
      req.logger.info(`Role del usuario con id: ${id}, cambiado exitosamente`)
      res.status(200).send('Role cambiado exitosamente')
    } else {
      req.logger.error(`Usuario no valido para el id: ${id}`)
      res.status(400).send(`Usuario no valido para el id: ${id}`)
    }
  } catch (error) {
    req.logger.fatal(
      `Se produjo un error al que obtener los datos para restaurar cambian el role, ${error.message}`
    )
    return res
      .status(500)
      .send(
        `Se produjo un error al que obtener los datos para restaurar cambian el role, ${error.message}`
      )
  }
}

//agregar documentos a user
export const addDocumentsToUser = async (req, res) => {
  try {
    const { uid } = req.params
    const files = req.files
    const addDocuments = await usersService.addDodumentUser(uid, files)
    if (addDocuments) {
      req.logger.info(`Documentos agregado con exito al usuario con id: ${uid}`)
      res.status(200).send('Documentos agregados exitosamente')
    } else {
      req.logger.error(`Error al cargar los documentos en el usuario con el id: ${uid}`)
      res.status(400).send(`Error al cargar los documentos en el usuario con el id: ${uid}`)
    }
  } catch (error) {
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

//trae a todos los usuarios
export const getUsers = async (req, res) => {
  try {
    req.logger.info('Se solicitan a todos los usuarios')
    const users = await usersService.getAllUsers()
    return users
  } catch (error) {
    req.logger.fatal(
      `Se produjo un error al intentar obtener a todos los usuario, ${error.message}`
    )
    return res
      .status(500)
      .send(`Se produjo un error al intentar obtener a todos los usuario, ${error.message}`)
  }
}

//elimina al usuario por su id
export const deleteUser = async (req, res) => {
  try {
    const id = req.body.id
    const userDelete = await usersService.deleteUserById(id)
    if (userDelete.deletedCount === 1) {
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
    const files = req.files
    const addNewStudednt = await usersService.addStudent(body, files)
    if (addDocuments) {
      req.logger.info(`Documentos agregado con exito al usuario con id: ${uid}`)
      res.status(200).send('Documentos agregados exitosamente')
    } else {
      req.logger.error(`Error al cargar los documentos en el usuario con el id: ${uid}`)
      res.status(400).send(`Error al cargar los documentos en el usuario con el id: ${uid}`)
    }
  } catch (error) {
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
