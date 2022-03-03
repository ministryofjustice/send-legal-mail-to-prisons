// eslint-disable-next-line import/no-extraneous-dependencies
import nock from 'nock'
import type { ContactHelpdeskForm } from 'forms'
import ZendeskService, { ZendeskTicket } from './ZendeskService'
import config from '../../config'

describe(`Zendesk Service`, () => {
  let zendeskService: ZendeskService
  let mockedZendeskApi: nock.Scope

  beforeEach(() => {
    mockedZendeskApi = nock(config.apis.zendesk.url, {
      reqheaders: { authorization: /Basic .+/ }, // asserts that all requests to the Zendesk API have a basic auth header
    })
    zendeskService = new ZendeskService()
  })

  afterEach(() => {
    nock.cleanAll()
  })

  describe('createSupportDeskTicket', () => {
    it('should create support desk ticket for a mailroom user and return its ID', done => {
      const contactHelpdeskForm: ContactHelpdeskForm = {
        pageId: 'scan-barcode',
        problemDetail: 'It doesnt scan',
        name: 'Mr Mail Room User',
        email: 'mailroom@brixton.prison.gov.uk',
      }
      const externalUser = false
      const username = 'DPS_USER'

      const expectedRequestBody: ZendeskTicket = {
        ticket: {
          subject: `Page ID: scan-barcode`,
          comment: {
            body: `
Page ID: scan-barcode

Description of issue: It doesnt scan

User ID: DPS_USER

Name: Mr Mail Room User
Email: mailroom@brixton.prison.gov.uk
`,
          },
          tags: ['SendLegalMail', 'slm_mailroom'],
          requester: {
            email: `mailroom@brixton.prison.gov.uk`,
          },
        },
      }
      mockedZendeskApi.post('/api/v2/tickets', expectedRequestBody).reply(201, { ticket: { id: 1234 } })

      zendeskService.createSupportTicket(contactHelpdeskForm, externalUser, username, null).then(ticketId => {
        expect(ticketId).toBe(1234)
        done()
      })
    })

    it('should create support desk ticket for a external user with an organisation and return its ID', done => {
      const contactHelpdeskForm: ContactHelpdeskForm = {
        pageId: 'review-recipients',
        problemDetail: 'I cant add a recipient',
        name: 'Mrs Legal Sender User',
        email: 'user@legal-sender.co.uk.cjsm.net',
      }
      const externalUser = true
      const username = 'user@legal-sender.co.uk.cjsm.net'
      const organisation = 'Legal Senders R Us'

      const expectedRequestBody: ZendeskTicket = {
        ticket: {
          subject: `Page ID: review-recipients`,
          comment: {
            body: `
Page ID: review-recipients

Description of issue: I cant add a recipient

CJSM email: user@legal-sender.co.uk.cjsm.net
CJSM organisation: Legal Senders R Us

Name: Mrs Legal Sender User
Email: user@legal-sender.co.uk.cjsm.net
`,
          },
          tags: ['SendLegalMail', 'slm_legal_sender'],
          requester: {
            email: `user@legal-sender.co.uk.cjsm.net`,
          },
        },
      }
      mockedZendeskApi.post('/api/v2/tickets', expectedRequestBody).reply(201, { ticket: { id: 1234 } })

      zendeskService.createSupportTicket(contactHelpdeskForm, externalUser, username, organisation).then(ticketId => {
        expect(ticketId).toBe(1234)
        done()
      })
    })

    it('should create support desk ticket for a external user without an organisation and return its ID', done => {
      const contactHelpdeskForm: ContactHelpdeskForm = {
        pageId: 'review-recipients',
        problemDetail: 'I cant add a recipient',
        name: 'Mrs Legal Sender User',
        email: 'user@legal-sender.co.uk.cjsm.net',
      }
      const externalUser = true
      const username = 'user@legal-sender.co.uk.cjsm.net'

      const expectedRequestBody: ZendeskTicket = {
        ticket: {
          subject: `Page ID: review-recipients`,
          comment: {
            body: `
Page ID: review-recipients

Description of issue: I cant add a recipient

CJSM email: user@legal-sender.co.uk.cjsm.net
CJSM organisation: N/A

Name: Mrs Legal Sender User
Email: user@legal-sender.co.uk.cjsm.net
`,
          },
          tags: ['SendLegalMail', 'slm_legal_sender'],
          requester: {
            email: `user@legal-sender.co.uk.cjsm.net`,
          },
        },
      }
      mockedZendeskApi.post('/api/v2/tickets', expectedRequestBody).reply(201, { ticket: { id: 1234 } })

      zendeskService.createSupportTicket(contactHelpdeskForm, externalUser, username, null).then(ticketId => {
        expect(ticketId).toBe(1234)
        done()
      })
    })
  })
})
