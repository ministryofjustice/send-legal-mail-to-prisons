import { Request, Response } from 'express'
import { SessionData } from 'express-session'
import ContactHelpdeskController from './ContactHelpdeskController'
import validate from './contactHelpdeskFormValidator'

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
}

describe('ContactHelpdeskController', () => {
  const contactHelpdeskController = new ContactHelpdeskController()

  afterEach(() => {
    res.render.mockReset()
    res.redirect.mockReset()
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

    it('should redirect to contact-helpdesk/submitted given no validation errors', async () => {
      req.baseUrl = '/scan-barcode/contact-helpdesk'
      req.originalUrl = '/scan-barcode/contact-helpdesk?pageId=scan-barcode'
      mockContactHelpdeskFormValidator.mockReturnValue([])

      await contactHelpdeskController.submitContactHelpdesk(req as unknown as Request, res as unknown as Response)

      expect(req.flash).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith('/scan-barcode/contact-helpdesk/submitted')
    })

    it('should redirect to contact-helpdesk given validation errors', async () => {
      req.baseUrl = '/scan-barcode/contact-helpdesk'
      req.originalUrl = '/scan-barcode/contact-helpdesk?pageId=scan-barcode'
      mockContactHelpdeskFormValidator.mockReturnValue([{ href: '#name', text: 'Enter a name' }])

      await contactHelpdeskController.submitContactHelpdesk(req as unknown as Request, res as unknown as Response)

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
