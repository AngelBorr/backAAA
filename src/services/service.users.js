import CustomError from './errors/customError.js'
import EErrors from './errors/enums.js'
import {
  generateUpdateRoleErrorInfo,
  generateUpdateRoleUserErrorInfo,
  generateUserErrorInfo
} from './errors/info.js'
import UserDTO from '../dto/user.dto.js'
import UsersManager from '../dao/managers/mongo/users.mongo.js'
import { createHash, generateToken } from '../utils.js'

class UsersService {
  constructor() {
    this.users = new UsersManager()
  }

  async getAllUsers() {
    try {
      const users = await this.users.getAllUsers()
      if (!users) {
        throw new Error('No se han encontrado Usuarios')
      } else {
        const usersDTO = users.map((user) => new UserDTO(user))
        return usersDTO
      }
    } catch (error) {}
  }

  //retorna el usuario
  async getUser(email) {
    try {
      if (!email) {
        console.log('error')
        CustomError.createError({
          name: 'user Creation Error',
          cause: generateUserErrorInfo({ email }),
          code: EErrors.INVALID_TYPES_ERROR,
          message: 'Error trying to create a new user'
        })
      }
      const user = await this.users.getUser(email)
      return user
    } catch (error) {
      throw new Error('Se produjo un error al leer el E-mail ingresado')
    }
  }

  async getUserById(id) {
    try {
      const user = await this.users.getUserById(id)
      return user
    } catch (error) {
      throw new Error('Se produjo un error al leer el id ingresado')
    }
  }

  //crea usuario
  async registerUser(data) {
    try {
      const { firstName, lastName, email, password, role } = data

      if (!firstName || !lastName || !email || !password) {
        return { success: false, message: 'Todos los campos son obligatorios' }
      }

      const normalizedEmail = email.trim().toLowerCase()
      const existingUser = await this.users.getUser(normalizedEmail)
      if (existingUser) {
        return { success: false, message: 'El usuario ya está registrado' }
      }

      const passwordRegex =
        /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&_.-])[A-Za-z\d@$!%*?&_.-]{8,30}$/

      if (!passwordRegex.test(password)) {
        return {
          success: false,
          message:
            'La contraseña debe tener entre 8 y 30 caracteres e incluir una mayúscula, una minúscula, un número y un símbolo.'
        }
      }

      const newUser = await this.users.createUser({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: normalizedEmail,
        password: createHash(password),
        role: role?.toLowerCase() || 'user'
      })

      if (!newUser || !newUser._id) {
        return { success: false, message: 'Error al crear el usuario en la base de datos' }
      }

      // 🧹 No se genera token aquí porque el registro requiere autenticación previa (ruta protegida)
      const safeUser = {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        role: newUser.role
      }

      return {
        success: true,
        message: 'Usuario creado correctamente',
        user: safeUser
      }
    } catch (error) {
      console.error('Error en registerUser:', error)
      throw new Error('Error interno al registrar usuario')
    }
  }

  //modificar user password
  async updateUser(email, newPassword) {
    try {
      if (!email || !newPassword) {
        const password = newPassword
        console.log('error')
        CustomError.createError({
          name: 'user Creation Error',
          cause: generateUserErrorInfo({ email, password }),
          code: EErrors.INVALID_TYPES_ERROR,
          message: 'Error trying to create a new user'
        })
      }
      const user = await this.users.getUsers(email)
      if (!user) {
        throw new Error(
          `No se ha encontrado Usuario resgistrado con este E-mail:(${email}), verifique que los datos ingresados sean los correctos y vuelve a intentarlo`
        )
      } else {
        const comparation = isValidPassword(user, newPassword)
        console.log('comparation', comparation)
        if (comparation === true) {
          req.logger.error('No se puede utilizar la misma contraseña, verifique los datos')
          throw new Error(
            `No se puede cambiar la pass ya que es la misma que se encuentra en la base de datos, verifique que los datos ingresados sean los correctos y vuelve a intentarlo`
          )
        } else {
          const updatePassword = createHash(newPassword)
          const updatePass = await this.users.updateUser(user._id, { password: updatePassword })
          return updatePass
        }
      }
    } catch (error) {
      throw new Error(`Error al actualizar la contraseña: ${error.message}`)
    }
  }

  //modificar el role de los user
  async updateRole(id, newRole) {
    try {
      const idUser = id
      const roleUpdate = newRole
      if (!idUser || !roleUpdate) {
        console.log('error')
        CustomError.createError({
          name: 'user Creation Error',
          cause: generateUpdateRoleErrorInfo({ idUser, roleUpdate }),
          code: EErrors.INVALID_TYPES_ERROR,
          message: 'Error trying to update role for user'
        })
      }
      const user = await this.users.getUserById(idUser)
      if (!user) {
        req.logger.error(`No existe usuario con este id: ${idUser}`)
        throw new Error(
          `No se ha encontrado Usuario resgistrado con este id:(${idUser}), verifique que los datos ingresados sean los correctos y vuelve a intentarlo`
        )
      }
      if (user.role === 'user') {
        const identification = await user.documents.some((e) => e.name === 'identification')
        const adress = await user.documents.some((e) => e.name === 'adress')
        const statusBank = await user.documents.some((e) => e.name === 'statusBank')
        if (identification === false || adress === false || statusBank === false) {
          console.log('error')
          CustomError.createError({
            name: 'user Creation Error',
            cause: generateUpdateRoleUserErrorInfo({ identification, adress, statusBank }),
            code: EErrors.INVALID_TYPES_ERROR,
            message: 'Error in documents to update role for user'
          })
        }
        const userUpdate = await this.users.updateUser(idUser, newRole)
        return userUpdate
      } else {
        const userUpdate = await this.users.updateUser(idUser, newRole)
        return userUpdate
      }
    } catch (error) {
      throw new Error(`Error al actualizar role: ${error.message}`)
    }
  }

  async addDodumentUser(id, files) {
    try {
      const user = await this.users.getUserById(id)
      if (!user) {
        req.logger.error('Usuario no encontrado')
        throw new Error(
          `No se ha encontrado Usuario registrado, verifique que los datos ingresados sean los correctos y vuelve a intentarlo`
        )
      }
      if (!files) {
        req.logger.error('Archivos no encontrado')
        throw new Error(
          `No se ha encontrado archivos para guardar en el usuario solicitado, verifique que los archivos ingresados se carguen correctamente y vuelve a intentarlo`
        )
      }
      const document = user.documents
      const newDocuments = [
        ...document,
        ...files.map((file) => ({ name: file.originalname, reference: file.path }))
      ]
      const updateDocumentUser = await this.users.updateUser(id, { documents: newDocuments })
      if (!updateDocumentUser) {
        req.logger.warning(
          `Error al realizar la operacion de agregar documentos al usuario con el id: ${id}`
        )
        throw new Error('Error al realizar la operacion de agregar documentos al usuario')
      }
      return updateDocumentUser
    } catch (error) {
      req.logger.error(`Error al agregar los dumentos al usuario: ${error.message}`)
      throw new Error(`Error al agregar los dumentos al usuario: ${error.message}`)
    }
  }

  async setLastConnection(user) {
    try {
      const id = user._id
      return await this.users.updateUser(id, { last_connection: new Date() })
    } catch (error) {
      console.log(error.message)
    }
  }

  async deleteUserById(id) {
    try {
      const userId = id
      const user = await this.users.getUserById(userId)
      if (!user) {
        throw new Error('El usuario no existe')
      } else {
        const deletedUser = await this.users.deleteUser(userId)
        if (!deletedUser) {
          throw new Error('No se pudo eliminar el usuario')
        } else {
          return deletedUser
        }
      }
    } catch (error) {
      console.log(error.message)
    }
  }
}

export default UsersService
