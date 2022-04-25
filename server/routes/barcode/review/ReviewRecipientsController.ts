import { Request, Response } from 'express'
import ReviewRecipientsView from './ReviewRecipientsView'

export default class ReviewRecipientsController {
  async getReviewRecipientsView(req: Request, res: Response): Promise<void> {
    if (!req.session.recipients) {
      return res.redirect('/barcode/find-recipient')
    }
    req.session.editContactForm = undefined
    req.session.reviewRecipientsForm = req.session.reviewRecipientsForm || {}

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
}
