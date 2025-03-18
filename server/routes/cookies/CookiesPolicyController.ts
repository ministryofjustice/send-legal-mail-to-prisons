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
    let redirectUrl = req.originalUrl === '/cookies-policy' ? req.originalUrl : req.session.cookiesPolicy.lastPage

    if (req.body.cookies) {
      res.cookie('cookies_policy', req.body.cookies, {
        maxAge: 365 * 24 * 60 * 60 * 1000,
        sameSite: 'lax',
        secure: true,
        httpOnly: true,
      })
      redirectUrl += '?showCookieConfirmation=true'

      if (req.is('application/json')) {
        // Form was submitted as an ajax request. Return a 200 status with a rendered nunjucks partial in the response body so
        // that jquery's ajax client does not try to follow the redirect (which would trigger a Google Analytics page count)
        // Client side code will take the partial from the response and render in the DOM on screen
        return res.render(
          'partials/cookies/cookie-preferences-set',
          { cookiesPolicy: { policy: req.body.cookies } },
          (err, html) => {
            return res.json({ partial: html })
          },
        )
      }
    }

    return res.redirect(redirectUrl)
  }

  async submitConfirmCookiesPolicy(req: Request, res: Response): Promise<void> {
    if (req.is('application/json')) {
      // Form was submitted as an ajax request. Return a 200 status so that jquery's ajax client does not try to follow
      // the redirect (which would trigger a Google Analytics page count)
      res.sendStatus(200)
      return null
    }
    return res.redirect(req.session.cookiesPolicy.lastPage)
  }
}
