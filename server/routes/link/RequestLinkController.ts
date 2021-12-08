import { Request, Response } from 'express'
import RequestLinkView from './RequestLinkView'
import validate from './RequestLinkValidator'
import MagicLinkService from '../../services/link/MagicLinkService'
import { ErrorResponse } from '../../@types/sendLegalMailApiClientTypes'

export default class RequestLinkController {
  constructor(private readonly magicLinkService: MagicLinkService) {}

  async getRequestLinkView(req: Request, res: Response): Promise<void> {
    const view = new RequestLinkView(req.session?.requestLinkForm || {}, req.flash('errors'))

    return res.render('pages/link/requestLink', { ...view.renderArgs })
  }

  async submitLinkRequest(req: Request, res: Response): Promise<void> {
    req.session.requestLinkForm = { ...req.body }
    if (!validate(req.session.requestLinkForm, req)) {
      return res.redirect('request-link')
    }

    return this.magicLinkService
      .requestLink(req.session.requestLinkForm.email)
      .then(() => {
        res.redirect('email-sent')
      })
      .catch(error => {
        const errorResponse: ErrorResponse = error.data
        const errorMessage =
          error.status === 400 &&
          Array.of('INVALID_CJSM_EMAIL', 'EMAIL_TOO_LONG').includes(errorResponse.errorCode.code)
            ? 'Enter an email address in the correct format'
            : 'There was an error generating your sign in link. Try again to request a new one to sign in.'
        req.flash('errors', [{ href: '#email', text: errorMessage }])
        res.redirect('request-link')
      })
  }
}
