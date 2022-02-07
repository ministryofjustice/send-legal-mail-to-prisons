import { Request, Response } from 'express'
import { SessionData } from 'express-session'
import ContactHelpdeskController from './ContactHelpdeskController'

const req = {
  session: {} as SessionData,
  flash: jest.fn(),
  query: {},
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
})
