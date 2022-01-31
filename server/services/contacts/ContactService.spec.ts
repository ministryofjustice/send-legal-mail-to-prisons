// eslint-disable-next-line import/no-extraneous-dependencies
import nock from 'nock'
import moment from 'moment'
import ContactService from './ContactService'
import config from '../../config'
import { ContactResponse } from '../../@types/sendLegalMailApiClientTypes'

jest.mock('../../data/hmppsAuthClient')

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

  describe('creatContact', () => {
    it('should include prison number in request', done => {
      const contactResponse: ContactResponse = {
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
      const contactResponse: ContactResponse = {
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

    it('should temporarily ignore 409 conflict errors', done => {
      const contact = {
        id: -1,
        prisonerName: 'some-name',
        prisonId: 'SKI',
        prisonNumber: 'A1234BC',
      }
      const errorResponse = {
        status: 409,
        errorCode: {
          code: 'CONFLICT',
          userMessage: 'Failed to create the resource',
        },
      }
      mockedSendLegalMailApi
        .post('/contact', { prisonerName: 'some-name', prisonId: 'SKI', prisonNumber: 'A1234BC' })
        .reply(409, errorResponse)

      contactService.createContact('some-user', 'some-name', 'SKI', 'A1234BC', undefined).then(response => {
        expect(response).toEqual(contact)
        done()
      })
    })
  })
})
