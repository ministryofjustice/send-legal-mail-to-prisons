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
}
