import { Request, Response } from 'express'

export default class ReviewRecipientsController {
  async getReviewRecipientsView(req: Request, res: Response): Promise<void> {
    return res.render('pages/barcode/review-recipients', {})
  }
}
