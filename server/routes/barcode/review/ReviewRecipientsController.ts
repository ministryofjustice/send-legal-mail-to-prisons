import { Request, Response } from 'express'
import ReviewRecipientsView from './ReviewRecipientsView'
import PrisonRegisterService from '../../../services/prison/PrisonRegisterService'

export default class ReviewRecipientsController {
  constructor(private readonly prisonRegisterService: PrisonRegisterService) {}

  async getReviewRecipientsView(req: Request, res: Response): Promise<void> {
    if (!req.session.recipients) {
      return res.redirect('/barcode/find-recipient')
    }
    req.session.editContactForm = undefined
    req.session.reviewRecipientsForm = req.session.reviewRecipientsForm || {}

    await this.ensureAllRecipientsHaveAPrison(req.session.recipients, req)

    const view = new ReviewRecipientsView(req.session.recipients, req.session.reviewRecipientsForm, req.flash('errors'))
    return res.render('pages/barcode/review-recipients', { ...view.renderArgs })
  }

  async postReviewRecipientsView(req: Request, res: Response): Promise<void> {
    req.session.reviewRecipientsForm = req.body

    if (req.session.reviewRecipientsForm.anotherRecipient === 'yes') {
      req.session.reviewRecipientsForm = undefined
      return res.redirect('/barcode/find-recipient')
    }

    if (req.session.reviewRecipientsForm.anotherRecipient === 'no') {
      req.session.reviewRecipientsForm = undefined
      return res.redirect('/barcode/choose-barcode-option')
    }

    req.flash('errors', [{ href: '#anotherRecipient', text: 'Select an option' }])
    return res.redirect('/barcode/review-recipients')
  }

  async removeRecipientByIndex(req: Request, res: Response): Promise<void> {
    if (!req.session.recipients) {
      return res.redirect('/barcode/find-recipient')
    }

    const recipients = [...req.session.recipients]
    // recipientIdx path param will be a string which we need as a number. eg: "2" -> 2
    // But the Number constructor returns 0 for falsy values such as empty string or null ... because ... javascript!
    const recipientIdxToRemove = Number(req.params.recipientIdx ? req.params.recipientIdx : undefined)
    if (
      Number.isNaN(recipientIdxToRemove) ||
      recipientIdxToRemove < 0 ||
      recipientIdxToRemove > recipients.length - 1
    ) {
      return res.redirect('/barcode/review-recipients')
    }

    recipients.splice(recipientIdxToRemove, 1)
    req.session.recipients = recipients

    return res.redirect('/barcode/review-recipients')
  }

  // TODO - remove this function and associated tests once we are sure prison register lookups via redis has been successfully rolled out
  async ensureAllRecipientsHaveAPrison(
    recipients: Array<{ prison?: unknown; prisonAddress?: { agencyCode: string } }>,
    req: Request
  ) {
    if (recipients.find(recipient => !recipient.prison && recipient.prisonAddress)) {
      // At least one recipient has no populated prison but still has a prisonAddress property

      req.session.recipients = await Promise.all(
        recipients.map(async recipient => {
          if (recipient.prison) {
            return recipient
          }

          const newRecipient = {
            ...recipient,
            prison: await this.prisonRegisterService.getPrison(recipient.prisonAddress.agencyCode),
          }
          delete newRecipient.prisonAddress
          return newRecipient
        })
      )
    }
  }
}
