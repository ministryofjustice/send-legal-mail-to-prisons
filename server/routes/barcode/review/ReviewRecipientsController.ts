import { Request, Response } from 'express'
import ReviewRecipientsView from './ReviewRecipientsView'

export default class ReviewRecipientsController {
  async getReviewRecipientsView(req: Request, res: Response): Promise<void> {
    if (!req.session.recipients) {
      return res.redirect('/barcode/find-recipient')
    }

    const view = new ReviewRecipientsView(req.session.recipients, req.flash('errors'))
    return res.render('pages/barcode/review-recipients', { ...view.renderArgs })
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
}
