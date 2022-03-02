import { NextFunction, Request, Response } from 'express'

export default class CookiesPolicyController {
  async initialiseCookieSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    if (!req.session.cookiesPolicy) {
      req.session.cookiesPolicy = { policy: undefined, showConfirmation: false, lastPage: req.originalUrl }
    }

    if (res.locals.externalUser) {
      req.session.cookiesPolicy.policy = req.cookies && req.cookies.cookies_policy
      req.session.cookiesPolicy.showConfirmation = req.query.showCookieConfirmation === 'true'
      if (!req.originalUrl.includes('cookies-policy')) {
        req.session.cookiesPolicy.lastPage = req.originalUrl.replace('?showCookieConfirmation=true', '')
      }
    } else {
      req.session.cookiesPolicy = { policy: 'n/a', showConfirmation: false, lastPage: req.originalUrl }
    }

    res.locals.cookiesPolicy = req.session.cookiesPolicy
    res.locals.url = req.originalUrl
    return next()
  }

  async getCookiesPolicyView(req: Request, res: Response): Promise<void> {
    res.render('pages/cookies/cookies-policy', {
      cookies: req.session.cookiesPolicy.policy,
    })
  }

  async submitCookiesPolicyPreferences(req: Request, res: Response): Promise<void> {
    let redirectUrl = req.session.cookiesPolicy.lastPage
    if (req.originalUrl === '/cookies-policy') {
      redirectUrl = '/cookies-policy'
    }
    if (req.body.cookies) {
      return res
        .cookie('cookies_policy', req.body.cookies, {
          maxAge: 365 * 24 * 60 * 60 * 1000,
          sameSite: 'lax',
          secure: true,
          httpOnly: true,
        })
        .redirect(`${redirectUrl}?showCookieConfirmation=true`)
    }
    return res.redirect(redirectUrl)
  }

  async submitConfirmCookiesPolicy(req: Request, res: Response): Promise<void> {
    return res.redirect(req.session.cookiesPolicy.lastPage)
  }
}
