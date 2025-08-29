import { GridFSBucket } from 'mongodb'
import mongoose from 'mongoose'

let gfsBucketInstance = null

export default class FileService {
  static getBucket() {
    if (!gfsBucketInstance && mongoose.connection.readyState === 1) {
      gfsBucketInstance = new GridFSBucket(mongoose.connection.db, {
        bucketName: 'studentFiles'
      })
      console.log('GridFSBucket creado desde servicio')
    }
    return gfsBucketInstance
  }

  static async ensureBucket() {
    if (!gfsBucketInstance) {
      // Esperar a que MongoDB esté conectado
      if (mongoose.connection.readyState !== 1) {
        await new Promise((resolve) => {
          mongoose.connection.once('connected', resolve)
        })
      }
      gfsBucketInstance = new GridFSBucket(mongoose.connection.db, {
        bucketName: 'studentFiles'
      })
    }
    return gfsBucketInstance
  }

  // ↓↓↓ MÉTODO PARA OBTENER ARCHIVO POR ID ↓↓↓
  static async getFileById(fileId) {
    try {
      const bucket = await this.ensureBucket()

      // Convertir string a ObjectId
      const objectId = new mongoose.Types.ObjectId(fileId)

      // Buscar el archivo en la colección files
      const files = await bucket.find({ _id: objectId }).toArray()

      if (!files || files.length === 0) {
        throw new Error('Archivo no encontrado en GridFS')
      }

      const fileInfo = files[0]

      return {
        success: true,
        fileInfo: {
          id: fileInfo._id,
          filename: fileInfo.filename,
          length: fileInfo.length,
          uploadDate: fileInfo.uploadDate,
          contentType: fileInfo.metadata?.contentType,
          metadata: fileInfo.metadata || {}
        },
        // Retornar una función que crea el stream cuando se necesite
        createDownloadStream: () => bucket.openDownloadStream(objectId)
      }
    } catch (error) {
      console.error('Error en getFileById:', error.message)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // ↓↓↓ MÉTODO PARA OBTENER INFORMACIÓN DEL ARCHIVO ↓↓↓
  static async getFileInfoById(fileId) {
    try {
      const bucket = await this.ensureBucket()

      if (!mongoose.Types.ObjectId.isValid(fileId)) {
        throw new Error('ID de archivo inválido')
      }

      const objectId = new mongoose.Types.ObjectId(fileId)
      const files = await bucket.find({ _id: objectId }).toArray()

      if (!files || files.length === 0) {
        throw new Error('Archivo no encontrado')
      }

      const fileInfo = files[0]
      return {
        success: true,
        data: {
          id: fileInfo._id,
          filename: fileInfo.filename,
          uploadDate: fileInfo.uploadDate,
          length: fileInfo.length,
          contentType: fileInfo.metadata?.contentType,
          metadata: fileInfo.metadata || {},
          chunkSize: fileInfo.chunkSize
        }
      }
    } catch (error) {
      console.error('Error en getFileInfoById:', error.message)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // ↓↓↓ MÉTODO PARA ELIMINAR ARCHIVO POR ID ↓↓↓
  static async deleteFileById(fileId) {
    try {
      const bucket = await this.ensureBucket()

      if (!mongoose.Types.ObjectId.isValid(fileId)) {
        throw new Error('ID de archivo inválido')
      }

      const objectId = new mongoose.Types.ObjectId(fileId)

      // Verificar que el archivo existe antes de eliminar
      const files = await bucket.find({ _id: objectId }).toArray()
      if (!files || files.length === 0) {
        throw new Error('Archivo no encontrado')
      }

      await bucket.delete(objectId)

      return {
        success: true,
        message: 'Archivo eliminado correctamente',
        deletedFileId: fileId,
        filename: files[0].filename
      }
    } catch (error) {
      console.error('Error en deleteFileById:', error.message)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // ↓↓↓ MÉTODO PARA SUBIR ARCHIVO ↓↓↓
  static async uploadFile(fileBuffer, filename, metadata = {}) {
    try {
      const bucket = await this.ensureBucket()

      return new Promise((resolve, reject) => {
        const uploadStream = bucket.openUploadStream(filename, {
          metadata: {
            ...metadata,
            uploadDate: new Date(),
            originalName: filename
          }
        })

        uploadStream.write(fileBuffer)
        uploadStream.end()

        uploadStream.on('finish', () => {
          resolve({
            success: true,
            fileId: uploadStream.id,
            filename: filename,
            metadata: metadata
          })
        })

        uploadStream.on('error', (error) => {
          reject({
            success: false,
            error: error.message
          })
        })
      })
    } catch (error) {
      console.error('Error en uploadFile:', error.message)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // ↓↓↓ MÉTODO PARA OBTENER TODOS LOS ARCHIVOS ↓↓↓
  static async getAllFiles(filter = {}) {
    try {
      const bucket = await this.ensureBucket()
      const files = await bucket.find(filter).toArray()

      return {
        success: true,
        files: files.map((file) => ({
          id: file._id,
          filename: file.filename,
          uploadDate: file.uploadDate,
          length: file.length,
          contentType: file.metadata?.contentType,
          metadata: file.metadata || {}
        })),
        count: files.length
      }
    } catch (error) {
      console.error('Error en getAllFiles:', error.message)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // ↓↓↓ MÉTODO PARA BUSCAR ARCHIVOS POR METADATA ↓↓↓
  static async findFilesByMetadata(metadataQuery) {
    try {
      const bucket = await this.ensureBucket()
      const files = await bucket
        .find({
          metadata: { $exists: true, ...metadataQuery }
        })
        .toArray()

      return {
        success: true,
        files: files.map((file) => ({
          id: file._id,
          filename: file.filename,
          uploadDate: file.uploadDate,
          metadata: file.metadata || {}
        })),
        count: files.length
      }
    } catch (error) {
      console.error('Error en findFilesByMetadata:', error.message)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // ↓↓↓ MÉTODO PARA VERIFICAR EXISTENCIA DE ARCHIVO ↓↓↓
  static async fileExists(fileId) {
    try {
      const bucket = await this.ensureBucket()

      if (!mongoose.Types.ObjectId.isValid(fileId)) {
        return { success: false, exists: false }
      }

      const objectId = new mongoose.Types.ObjectId(fileId)
      const files = await bucket.find({ _id: objectId }).toArray()

      return {
        success: true,
        exists: files && files.length > 0,
        file: files && files.length > 0 ? files[0] : null
      }
    } catch (error) {
      console.error('Error en fileExists:', error.message)
      return {
        success: false,
        error: error.message
      }
    }
  }
}
