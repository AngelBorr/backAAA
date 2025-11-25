import { expect } from 'chai'
import request from 'supertest'
import { app } from './setup.js'
import mongoose from 'mongoose'

describe('📝 Inscriptions API (Tests Finales)', function () {
  this.timeout(10000)

  let testInscriptionId
  let testEmail = 'test@example.com'

  const validData = {
    name: 'Juan',
    lastName: 'Pérez',
    document: 12345678,
    nationality: 'Argentino',
    birthDate: '1990-01-01',
    placeOfBirth: 'Buenos Aires',
    email: testEmail,
    cellPhone: 1122334455,
    address: 'Calle Falsa 123',
    postalCode: 1425,
    province: 'Buenos Aires',
    locality: 'La Plata',
    occupation: 'Desarrollador',
    studies: 'Universitario',
    sportBackground: 'Fútbol amateur'
  }

  // Helper
  const createTestInscription = async (custom = {}) => {
    const response = await request(app)
      .post('/api/inscriptions/add')
      .send({ ...validData, ...custom })
      .expect('Content-Type', /json/)

    return response
  }

  // ----------------------------------------------------------------------------
  // GET ALL
  // ----------------------------------------------------------------------------

  describe('GET /api/inscriptions/', () => {
    it('❌ Debe retornar 404 cuando no hay inscripciones', async () => {
      const res = await request(app).get('/api/inscriptions/').expect(404)

      expect(res.body.success).to.equal(false)
      expect(res.body.message).to.include('No se han encontrado')
    })

    it('✔ Debe retornar inscripciones si existen', async () => {
      await createTestInscription({ email: 'uno@example.com' })
      await createTestInscription({ email: 'dos@example.com' })

      const res = await request(app).get('/api/inscriptions/').expect(200)

      expect(res.body.success).to.equal(true)
      expect(res.body.data).to.be.an('array')
      expect(res.body.data.length).to.be.at.least(2)
    })
  })

  // ----------------------------------------------------------------------------
  // GET BY EMAIL
  // ----------------------------------------------------------------------------

  describe('GET /api/inscriptions/email/:email', () => {
    it('❌ Email inválido → 400', async () => {
      const res = await request(app).get('/api/inscriptions/email/invalid-email').expect(400)

      expect(res.body.success).to.equal(false)
      expect(res.body.message).to.include('Debe proporcionar un email válido')
    })

    it('❌ Email inexistente → 400', async () => {
      const res = await request(app).get('/api/inscriptions/email/noexiste@example.com').expect(400)

      expect(res.body.success).to.equal(false)
      expect(res.body.message).to.include('No se encontró un usuario')
    })

    it('✔ Debe retornar inscripción por email', async () => {
      const testEmail = 'findme@example.com'

      await createTestInscription({ email: testEmail })

      const res = await request(app).get(`/api/inscriptions/email/${testEmail}`).expect(200)

      expect(res.body.success).to.equal(true)
      expect(res.body.data.email).to.equal(testEmail)
    })
  })

  // ----------------------------------------------------------------------------
  // GET BY ID
  // ----------------------------------------------------------------------------

  describe('GET /api/inscriptions/id/:id', () => {
    it('❌ ID inválido → 400', async () => {
      const res = await request(app).get('/api/inscriptions/id/invalid-id').expect(400)

      expect(res.body.success).to.equal(false)
      expect(res.body.message).to.include('ID proporcionado no es válido')
    })

    it('❌ ID inexistente → 404', async () => {
      const fakeId = new mongoose.Types.ObjectId()

      const res = await request(app).get(`/api/inscriptions/id/${fakeId}`).expect(404)

      expect(res.body.success).to.equal(false)
    })

    it('✔ Debe retornar inscripción por ID', async () => {
      const created = await createTestInscription()
      const id = created.body.data._id

      const res = await request(app).get(`/api/inscriptions/id/${id}`).expect(200)

      expect(res.body.success).to.equal(true)
      expect(res.body.data._id).to.equal(id)
    })
  })

  // ----------------------------------------------------------------------------
  // POST CREATE
  // ----------------------------------------------------------------------------

  describe('POST /api/inscriptions/add', () => {
    it('❌ Faltan campos → 400', async () => {
      const res = await request(app)
        .post('/api/inscriptions/add')
        .send({ name: 'Juan' })
        .expect(400)

      expect(res.body.message).to.include('Faltan campos obligatorios')
    })

    it('❌ Email inválido → 400', async () => {
      const res = await request(app)
        .post('/api/inscriptions/add')
        .send({ ...validData, email: 'invalid-email' })
        .expect(400)

      expect(res.body.message).to.include('El email debe tener un formato válido')
    })

    it('❌ Documento inválido → 400', async () => {
      const res = await request(app)
        .post('/api/inscriptions/add')
        .send({ ...validData, document: 'abc123' })
        .expect(400)

      expect(res.body.message).to.include('El documento debe ser un número')
    })

    it('❌ Email duplicado → 500', async () => {
      await createTestInscription({ email: 'dup@example.com' })

      const res = await request(app)
        .post('/api/inscriptions/add')
        .send({ ...validData, email: 'dup@example.com' })
        .expect(500)

      expect(res.body.success).to.equal(false)
    })

    it('✔ Debe crear la inscripción', async () => {
      const res = await createTestInscription()

      expect(res.status).to.equal(201)
      expect(res.body.success).to.equal(true)
      expect(res.body.data).to.have.property('_id')

      testInscriptionId = res.body.data._id
    })

    it('✔ Debe normalizar strings (trim) y email lower', async () => {
      const res = await request(app)
        .post('/api/inscriptions/add')
        .send({
          ...validData,
          name: '  Juan  ',
          lastName: '  Pérez  ',
          email: 'TEST@EXAMPLE.COM'
        })
        .expect(201)

      expect(res.body.data.name).to.equal('Juan')
      expect(res.body.data.lastName).to.equal('Pérez')
      expect(res.body.data.email).to.equal('test@example.com')
    })
  })

  // ----------------------------------------------------------------------------
  // DELETE
  // ----------------------------------------------------------------------------

  describe('DELETE /api/inscriptions/:id', () => {
    it('❌ ID inválido → 400', async () => {
      const res = await request(app).delete('/api/inscriptions/invalid-id').expect(400)

      expect(res.body.success).to.equal(false)
    })

    it('❌ ID inexistente → 400', async () => {
      const fakeId = new mongoose.Types.ObjectId()

      const res = await request(app).delete(`/api/inscriptions/${fakeId}`).expect(400)

      expect(res.body.message).to.include('no existe')
    })

    it('✔ Debe eliminar correctamente', async () => {
      const { body } = await createTestInscription()
      const id = body.data._id

      await request(app).delete(`/api/inscriptions/${id}`).expect(200)
      await request(app).get(`/api/inscriptions/id/${id}`).expect(404)
    })
  })
})
