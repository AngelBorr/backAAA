import mongoose from 'mongoose'
import FileService from '../services/service.files.js'

//const serviceFiles = new FileService()

export const getFileById = async (req, res) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID de archivo inválido'
      })
    }

    const gfsBucket = await FileService.ensureBucket()

    const files = await gfsBucket.find({ _id: new mongoose.Types.ObjectId(id) }).toArray()

    if (!files || files.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Archivo no encontrado'
      })
    }

    const file = files[0]
    res.set('Content-Type', file.metadata?.contentType || 'application/octet-stream')
    res.set('Content-Disposition', `inline; filename="${file.filename}"`)
    res.set('Cache-Control', 'public, max-age=86400') // Cache de 1 día

    const downloadStream = req.gfsBucket.openDownloadStream(new mongoose.Types.ObjectId(id))

    downloadStream.on('error', (error) => {
      console.error('Error en stream de descarga:', error)
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          error: 'Error al descargar el archivo'
        })
      }
    })

    downloadStream.pipe(res)
  } catch (error) {
    console.error('Error descargando archivo:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

export const getInfoFileById = async (req, res) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID de archivo inválido' })
    }

    const gfsBucket = await FileService.ensureBucket()

    const files = await gfsBucket.find({ _id: new mongoose.Types.ObjectId(id) }).toArray()

    if (!files || files.length === 0) {
      return res.status(404).json({ error: 'Archivo no encontrado' })
    }

    const fileInfo = {
      id: files[0]._id,
      filename: files[0].filename,
      uploadDate: files[0].uploadDate,
      metadata: files[0].metadata,
      length: files[0].length,
      contentType: files[0].metadata?.contentType
    }

    res.json(fileInfo)
  } catch (error) {
    console.error('Error obteniendo información del archivo:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

// Eliminar archivo por ID
export const deleteFile = async (req, res) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID de archivo inválido' })
    }

    const gfsBucket = await FileService.ensureBucket()

    await gfsBucket.delete(new mongoose.Types.ObjectId(id))
    res.status(200).json({ message: 'Archivo eliminado correctamente' })
  } catch (error) {
    console.error('Error eliminando archivo:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}
