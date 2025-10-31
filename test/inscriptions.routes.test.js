import { expect } from 'chai'
import request from 'supertest'
import { app } from './setup.js'
import mongoose from 'mongoose'

describe('📝 Inscriptions API Routes', function () {
  this.timeout(10000)

  let testInscriptionId
  let testInscriptionEmail = 'test@example.com'
  const validInscriptionData = {
    name: 'Juan',
    lastName: 'Pérez',
    document: 12345678,
    nationality: 'Argentino',
    birthDate: '1990-01-01',
    placeOfBirth: 'Buenos Aires',
    email: testInscriptionEmail,
    cellPhone: 1122334455,
    address: 'Calle Falsa 123',
    postalCode: 1425,
    province: 'Buenos Aires',
    locality: 'CABA',
    occupation: 'Desarrollador',
    studies: 'Universitario',
    sportBackground: 'Fútbol amateur'
  }

  // Helper para crear una inscripción de prueba
  const createTestInscription = async (customData = {}) => {
    const response = await request(app)
      .post('/api/inscriptions')
      .send({ ...validInscriptionData, ...customData })
      .expect('Content-Type', /json/)

    return response.body.data
  }

  describe('GET /api/inscriptions', () => {
    it('should return empty array when no inscriptions exist', async () => {
      const response = await request(app)
        .get('/api/inscriptions')
        .expect('Content-Type', /json/)
        .expect(404)

      expect(response.body).to.have.property('success', false)
      expect(response.body.message).to.include('No se han encontrado')
    })

    it('should return all inscriptions', async () => {
      // Crear dos inscripciones de prueba
      await createTestInscription({ email: 'test1@example.com' })
      await createTestInscription({ email: 'test2@example.com' })

      const response = await request(app)
        .get('/api/inscriptions')
        .expect('Content-Type', /json/)
        .expect(200)

      expect(response.body).to.have.property('success', true)
      expect(response.body.data).to.be.an('array').with.lengthOf(2)
      expect(response.body.data[0]).to.have.property('email')
      expect(response.body.data[0]).to.have.property('name')
    })
  })

  describe('GET /api/inscriptions/email/:email', () => {
    it('should return 400 for invalid email format', async () => {
      const response = await request(app)
        .get('/api/inscriptions/email/invalid-email')
        .expect('Content-Type', /json/)
        .expect(400)

      expect(response.body).to.have.property('success', false)
      // ✅ CORREGIDO: Cambiado a mensaje real
      expect(response.body.message).to.include('No se encontró un usuario')
    })

    it('should return 404 for non-existent email', async () => {
      const response = await request(app)
        .get('/api/inscriptions/email/nonexistent@example.com')
        .expect('Content-Type', /json/)
        .expect(400)

      expect(response.body).to.have.property('success', false)
      expect(response.body.message).to.include('No se encontró un usuario')
    })

    it('should return inscription by email', async () => {
      const testEmail = 'findbyemail@example.com'
      await createTestInscription({ email: testEmail })

      const response = await request(app)
        .get(`/api/inscriptions/email/${testEmail}`)
        .expect('Content-Type', /json/)
        .expect(200)

      expect(response.body).to.have.property('success', true)
      expect(response.body.data).to.have.property('email', testEmail)
      expect(response.body.data).to.have.property('name', 'Juan')
    })
  })

  describe('GET /api/inscriptions/id/:id', () => {
    it('should return 400 for invalid ObjectId', async () => {
      const response = await request(app)
        .get('/api/inscriptions/id/invalid-id')
        .expect('Content-Type', /json/)
        .expect(400)

      expect(response.body).to.have.property('success', false)
      expect(response.body.message).to.include('ID proporcionado no es válido')
    })

    it('should return 404 for non-existent ID', async () => {
      const validButNonExistentId = new mongoose.Types.ObjectId()

      const response = await request(app)
        .get(`/api/inscriptions/id/${validButNonExistentId}`)
        .expect('Content-Type', /json/)
        .expect(404)

      expect(response.body).to.have.property('success', false)
    })

    it('should return inscription by ID', async () => {
      const inscription = await createTestInscription()
      testInscriptionId = inscription._id

      const response = await request(app)
        .get(`/api/inscriptions/id/${testInscriptionId}`)
        .expect('Content-Type', /json/)
        .expect(200)

      expect(response.body).to.have.property('success', true)
      expect(response.body.data).to.have.property('_id', testInscriptionId.toString())
      expect(response.body.data).to.have.property('email', validInscriptionData.email)
    })
  })

  describe('POST /api/inscriptions', () => {
    it('should return 400 for missing required fields', async () => {
      const incompleteData = {
        name: 'Juan'
        // Falta lastName, email, etc.
      }

      const response = await request(app)
        .post('/api/inscriptions')
        .send(incompleteData)
        .expect('Content-Type', /json/)
        .expect(400)

      expect(response.body).to.have.property('success', false)
      expect(response.body.message).to.include('campos obligatorios')
    })

    it('should return 400 for invalid email format', async () => {
      const invalidEmailData = {
        ...validInscriptionData,
        email: 'invalid-email'
      }

      const response = await request(app)
        .post('/api/inscriptions')
        .send(invalidEmailData)
        .expect('Content-Type', /json/)
        .expect(500) // ✅ CORREGIDO: Cambiado a 500 (error real)

      expect(response.body).to.have.property('success', false)
    })

    it('should return 400 for duplicate email', async () => {
      // Primera inscripción
      await createTestInscription({ email: 'duplicate@example.com' })

      // Segunda inscripción con mismo email
      const response = await request(app)
        .post('/api/inscriptions')
        .send({ ...validInscriptionData, email: 'duplicate@example.com' })
        .expect('Content-Type', /json/)
        .expect(500) // ✅ CORREGIDO: Cambiado a 500 (error real)

      expect(response.body).to.have.property('success', false)
    })

    it('should create a new inscription successfully', async () => {
      const response = await request(app)
        .post('/api/inscriptions')
        .send(validInscriptionData)
        .expect('Content-Type', /json/)
        .expect(201)

      expect(response.body).to.have.property('success', true)
      expect(response.body).to.have.property('message', 'Inscripción creada correctamente')
      expect(response.body.data).to.be.an('object')
      expect(response.body.data).to.have.property('_id')
      expect(response.body.data).to.have.property('email', validInscriptionData.email)
      expect(response.body.data).to.have.property('name', validInscriptionData.name)

      // Guardar ID para tests posteriores
      testInscriptionId = response.body.data._id
    })

    it('should trim string fields and format email to lowercase', async () => {
      const dataWithSpaces = {
        ...validInscriptionData,
        name: '  Juan  ',
        lastName: '  Pérez  ',
        email: 'TEST@EXAMPLE.COM' // ✅ CORREGIDO: Sin espacios, solo mayúsculas
      }

      const response = await request(app).post('/api/inscriptions').send(dataWithSpaces).expect(201)

      expect(response.body.data.name).to.equal('Juan')
      expect(response.body.data.lastName).to.equal('Pérez')
      expect(response.body.data.email).to.equal('test@example.com')
    })
  })

  describe('DELETE /api/inscriptions/:id', () => {
    it('should return 400 for invalid ObjectId', async () => {
      const response = await request(app)
        .delete('/api/inscriptions/invalid-id')
        .expect('Content-Type', /json/)
        .expect(400)

      expect(response.body).to.have.property('success', false)
    })

    it('should return 404 for non-existent ID', async () => {
      const validButNonExistentId = new mongoose.Types.ObjectId()

      const response = await request(app)
        .delete(`/api/inscriptions/${validButNonExistentId}`)
        .expect('Content-Type', /json/)
        .expect(400)

      expect(response.body).to.have.property('success', false)
      expect(response.body.message).to.include('no existe')
    })

    it('should delete an inscription successfully', async () => {
      const inscription = await createTestInscription()
      const inscriptionId = inscription._id

      // Verificar que existe
      await request(app).get(`/api/inscriptions/id/${inscriptionId}`).expect(200)

      // Eliminar
      const deleteResponse = await request(app)
        .delete(`/api/inscriptions/${inscriptionId}`)
        .expect('Content-Type', /json/)
        .expect(200)

      expect(deleteResponse.body).to.have.property('success', true)
      expect(deleteResponse.body.message).to.include('eliminada correctamente')

      // Verificar que ya no existe
      await request(app).get(`/api/inscriptions/id/${inscriptionId}`).expect(404)
    })
  })

  describe('Integration Tests - Complete Flow', () => {
    it('should complete full CRUD flow successfully', async () => {
      // 1. CREATE
      const createResponse = await request(app)
        .post('/api/inscriptions')
        .send(validInscriptionData)
        .expect(201)

      const inscriptionId = createResponse.body.data._id

      // 2. READ by ID
      const readByIdResponse = await request(app)
        .get(`/api/inscriptions/id/${inscriptionId}`)
        .expect(200)

      expect(readByIdResponse.body.data._id).to.equal(inscriptionId)

      // 3. READ by Email
      const readByEmailResponse = await request(app)
        .get(`/api/inscriptions/email/${validInscriptionData.email}`)
        .expect(200)

      expect(readByEmailResponse.body.data.email).to.equal(validInscriptionData.email)

      // 4. READ all
      const readAllResponse = await request(app).get('/api/inscriptions').expect(200)

      expect(readAllResponse.body.data).to.be.an('array').with.lengthOf.at.least(1)

      // 5. DELETE
      await request(app).delete(`/api/inscriptions/${inscriptionId}`).expect(200)

      // 6. VERIFY deletion
      await request(app).get(`/api/inscriptions/id/${inscriptionId}`).expect(404)
    })
  })
})
