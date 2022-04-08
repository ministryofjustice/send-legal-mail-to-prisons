import { Request, Response } from 'express'
import OneTimeCodeService from '../../services/one-time-code-auth/OneTimeCodeService'

export default class VerifyOneTimeCodeController {
  constructor(private readonly oneTimeCodeService: OneTimeCodeService) {}

  async verifyOneTimeCode(_req: Request, _res: Response): Promise<void> {
    return null
  }
}
