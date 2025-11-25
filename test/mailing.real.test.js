// test/mailing.real.test.js
import MailingService from '../src/services/service.mailing.js'
import mongoose from 'mongoose'
import { expect } from 'chai'
import env from '../src/config.js'
import { injectMailingService } from '../src/services/service.inscription.js'

describe('📧 Test REAL – Envío de email con Nodemailer', function () {
  this.timeout(20000)

  let mailingService

  before(async () => {
    mailingService = new MailingService()
    injectMailingService(mailingService)

    await mongoose.connect(env.mongo.url)
  })

  after(async () => {
    await mongoose.connection.close()
  })

  it('Debe enviar un email real a angelborre@gmail.com', async () => {
    const email = 'angelborre@gmail.com'

    const result = await mailingService.createEmailValidationIncription(email)

    expect(result).to.have.property('accepted')
    expect(result.accepted[0]).to.equal(email)
  })
})
