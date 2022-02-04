// eslint-disable-next-line import/no-extraneous-dependencies
import nock from 'nock'
import moment from 'moment'
import type { Contact } from 'sendLegalMailApiClient'
import ContactService from './ContactService'
import config from '../../config'

jest.mock('../../data/hmppsAuthClient')

const aContact: Contact = {
  id: 1,
  prisonerName: 'John Smith',
  prisonId: 'SKI',
  prisonNumber: 'A1234BC',
}

describe('Contact Service', () => {
  let contactService: ContactService
  let mockedSendLegalMailApi: nock.Scope

  beforeEach(() => {
    mockedSendLegalMailApi = nock(config.apis.sendLegalMail.url)

    contactService = new ContactService()
  })

  afterEach(() => {
    nock.cleanAll()
  })

  describe('createContact', () => {
    it('should include prison number in request', done => {
      const contactResponse: Contact = {
        id: 1,
        prisonerName: 'some-name',
        prisonId: 'SKI',
        prisonNumber: 'A1234BC',
      }
      mockedSendLegalMailApi
        .post('/contact', { prisonerName: 'some-name', prisonId: 'SKI', prisonNumber: 'A1234BC' })
        .reply(201, contactResponse)

      contactService.createContact('some-token', 'some-name', 'SKI', 'A1234BC', undefined).then(response => {
        expect(response).toStrictEqual(contactResponse)
        done()
      })
    })

    it('should include dob in request', done => {
      const contactResponse: Contact = {
        id: 1,
        prisonerName: 'some-name',
        prisonId: 'SKI',
        dob: '1990-02-27',
      }
      mockedSendLegalMailApi
        .post('/contact', { prisonerName: 'some-name', prisonId: 'SKI', dob: '1990-02-27' })
        .reply(201, contactResponse)

      contactService
        .createContact('some-token', 'some-name', 'SKI', undefined, moment('1990-02-27').toDate())
        .then(response => {
          expect(response).toStrictEqual(contactResponse)
          done()
        })
    })

    it('should handle error response', done => {
      const errorResponse = {
        status: 400,
        errorCode: {
          code: 'MALFORMED_REQUEST',
          userMessage: 'Failed to read the payload',
        },
      }
      mockedSendLegalMailApi
        .post('/contact', { prisonerName: 'some-name', prisonId: 'SKI', prisonNumber: 'THIS IS TOO LONG' })
        .reply(400, errorResponse)

      contactService.createContact('some-token', 'some-name', 'SKI', 'THIS IS TOO LONG', undefined).catch(error => {
        expect(JSON.parse(error.text)).toStrictEqual(errorResponse)
        done()
      })
    })
  })

  describe('searchContacts', () => {
    it('should search by name', done => {
      mockedSendLegalMailApi.get('/contacts').query({ name: 'Smith' }).reply(200, [aContact])

      contactService.searchContacts('some-token', 'Smith').then(response => {
        expect(response).toStrictEqual([aContact])
        done()
      })
    })

    it('should handle zero results', done => {
      mockedSendLegalMailApi.get('/contacts').query({ name: 'Smith' }).reply(200, [])

      contactService.searchContacts('some-token', 'Smith').then(response => {
        expect(response).toStrictEqual([])
        done()
      })
    })

    it('should handle an error response', done => {
      const errorResponse = {
        status: 400,
        errorCode: {
          code: 'MALFORMED_REQUEST',
          userMessage: 'Failed to read the payload',
        },
      }
      mockedSendLegalMailApi.get('/contacts').query({ name: '' }).reply(400, errorResponse)

      contactService.searchContacts('some-token', '').catch(error => {
        expect(JSON.parse(error.text)).toStrictEqual(errorResponse)
        done()
      })
    })
  })

  describe('getContact', () => {
    it('should return a contact if found', done => {
      mockedSendLegalMailApi.get('/contact/A1234BC').reply(200, aContact)

      contactService.getContact('some-token', 'A1234BC').then(response => {
        expect(response).toStrictEqual(aContact)
        done()
      })
    })

    it('should return undefined if not found', done => {
      mockedSendLegalMailApi.get('/contact/A1234BC').reply(404)

      contactService.getContact('some-token', 'A1234BC').then(response => {
        expect(response).toBeUndefined()
        done()
      })
    })

    it('should handle an error response', done => {
      const errorResponse = {
        status: 400,
        errorCode: {
          code: 'MALFORMED_REQUEST',
          userMessage: 'Failed to read the payload',
        },
      }
      mockedSendLegalMailApi.get('/contact/A1234BC').reply(400, errorResponse)

      contactService.getContact('some-token', 'A1234BC').catch(error => {
        expect(JSON.parse(error.text)).toStrictEqual(errorResponse)
        done()
      })
    })
  })
})
