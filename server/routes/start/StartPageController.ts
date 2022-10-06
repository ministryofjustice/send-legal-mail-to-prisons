import { Request, Response } from 'express'

export default class StartPageController {
  async getStartPageView(req: Request, res: Response): Promise<void> {
    res.render('pages/start/legal-sender-start-page')
  }
}
