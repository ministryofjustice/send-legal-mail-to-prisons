import { Request, Response } from 'express'
import { SessionData } from 'express-session'
import type { ContactHelpdeskForm } from 'forms'
import ContactHelpdeskController from './ContactHelpdeskController'
import validate from './contactHelpdeskFormValidator'
import ZendeskService from '../../services/helpdesk/ZendeskService'

jest.mock('./contactHelpdeskFormValidator')

const req = {
  session: {} as SessionData,
  flash: jest.fn(),
  query: {},
  baseUrl: '',
  originalUrl: '',
  body: {},
}
const res = {
  render: jest.fn(),
  redirect: jest.fn(),
  locals: {},
}

const zendeskService = {
  createSupportTicket: jest.fn(),
}

describe('ContactHelpdeskController', () => {
  const contactHelpdeskController = new ContactHelpdeskController(zendeskService as unknown as ZendeskService)

  afterEach(() => {
    zendeskService.createSupportTicket.mockReset()
    res.render.mockReset()
    res.redirect.mockReset()
    res.locals = { externalUser: true, user: undefined }
    req.session = {} as SessionData
    req.flash.mockReset()
    req.query = {}
    req.baseUrl = ''
    req.originalUrl = ''
    req.body = {}
  })

  describe('getContactHelpdeskView', () => {
    it('should render the view given a pageId query string parameter', async () => {
      req.query = { pageId: 'review-recipients' }

      const expectedRenderArgs = {
        form: { pageId: 'review-recipients' },
        errors: [] as Array<Record<string, string>>,
      }

      await contactHelpdeskController.getContactHelpdeskView(req as unknown as Request, res as unknown as Response)

      expect(res.render).toHaveBeenCalledWith('pages/helpdesk/contact-helpdesk', expectedRenderArgs)
    })

    it('should render the view given no pageId query string parameter', async () => {
      req.query = {}

      const expectedRenderArgs = {
        form: { pageId: 'unknown' },
        errors: [] as Array<Record<string, string>>,
      }

      await contactHelpdeskController.getContactHelpdeskView(req as unknown as Request, res as unknown as Response)

      expect(res.render).toHaveBeenCalledWith('pages/helpdesk/contact-helpdesk', expectedRenderArgs)
    })
  })

  describe('submitContactHelpdesk', () => {
    let mockContactHelpdeskFormValidator: jest.MockedFunction<typeof validate>

    beforeEach(() => {
      mockContactHelpdeskFormValidator = validate as jest.MockedFunction<typeof validate>
    })

    it('should redirect to contact-helpdesk/submitted given DPS authenticated user and no validation errors', async () => {
      req.baseUrl = '/scan-barcode/contact-helpdesk'
      req.originalUrl = '/scan-barcode/contact-helpdesk?pageId=scan-barcode'
      const contactHelpdeskForm: ContactHelpdeskForm = {
        pageId: 'scan-barcode',
        problemDetail: 'It doesnt scan',
        name: 'Mr Mail Room User',
        email: 'mailroom@brixton.prison.gov.uk',
      }
      req.body = contactHelpdeskForm
      mockContactHelpdeskFormValidator.mockReturnValue([])
      res.locals = { externalUser: false, user: { username: 'DPS_USER' } }

      await contactHelpdeskController.submitContactHelpdesk(req as unknown as Request, res as unknown as Response)

      expect(req.session.contactHelpdeskForm).toBeUndefined()
      expect(zendeskService.createSupportTicket).toHaveBeenCalledWith(contactHelpdeskForm, false, 'DPS_USER', null)
      expect(req.flash).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith('/scan-barcode/contact-helpdesk/submitted')
    })

    it('should redirect to contact-helpdesk/submitted given external user and no validation errors', async () => {
      req.baseUrl = '/contact-helpdesk'
      req.originalUrl = '/contact-helpdesk?pageId=review-recipients'
      const contactHelpdeskForm: ContactHelpdeskForm = {
        pageId: 'review-recipients',
        problemDetail: 'I cant add a recipient',
        name: 'Mrs Legal Sender User',
        email: 'user@legal-sender.co.uk.cjsm.net',
      }
      req.body = contactHelpdeskForm
      mockContactHelpdeskFormValidator.mockReturnValue([])
      res.locals = { externalUser: true }
      req.session.barcodeUserEmail = 'user@legal-sender.co.uk.cjsm.net'
      req.session.barcodeUserOrganisation = 'Legal Senders R Us'

      await contactHelpdeskController.submitContactHelpdesk(req as unknown as Request, res as unknown as Response)

      expect(req.session.contactHelpdeskForm).toBeUndefined()
      expect(zendeskService.createSupportTicket).toHaveBeenCalledWith(
        contactHelpdeskForm,
        true,
        'user@legal-sender.co.uk.cjsm.net',
        'Legal Senders R Us'
      )
      expect(req.flash).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith('/contact-helpdesk/submitted')
    })

    it('should redirect to contact-helpdesk given validation errors', async () => {
      req.baseUrl = '/scan-barcode/contact-helpdesk'
      req.originalUrl = '/scan-barcode/contact-helpdesk?pageId=scan-barcode'
      mockContactHelpdeskFormValidator.mockReturnValue([{ href: '#name', text: 'Enter a name' }])

      await contactHelpdeskController.submitContactHelpdesk(req as unknown as Request, res as unknown as Response)

      expect(zendeskService.createSupportTicket).not.toHaveBeenCalled()
      expect(req.flash).toHaveBeenCalledWith('errors', [{ href: '#name', text: 'Enter a name' }])
      expect(res.redirect).toHaveBeenCalledWith('/scan-barcode/contact-helpdesk?pageId=scan-barcode')
    })
  })

  describe('getContactHelpdeskSubmittedView', () => {
    it('should render the view given a pageId query string parameter', async () => {
      await contactHelpdeskController.getContactHelpdeskSubmittedView(
        req as unknown as Request,
        res as unknown as Response
      )

      expect(res.render).toHaveBeenCalledWith('pages/helpdesk/submitted', {})
    })
  })
})
