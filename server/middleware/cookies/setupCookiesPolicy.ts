import express, { Router } from 'express'
import CookiesPolicyController from '../../routes/cookies/CookiesPolicyController'

export default function setupCookiesPolicy(): Router {
  const router = express.Router()
  const cookiesPolicyController = new CookiesPolicyController()

  router.use((req, res, next) => cookiesPolicyController.initialiseCookieSession(req, res, next))

  router.get('/cookies-policy', (req, res) => cookiesPolicyController.getCookiesPolicyView(req, res))

  router.post('/cookies-policy/preferences', (req, res) =>
    cookiesPolicyController.submitCookiesPolicyPreferences(req, res),
  )
  router.post('/cookies-policy', (req, res) => cookiesPolicyController.submitCookiesPolicyPreferences(req, res))

  router.post('/cookies-policy/confirm', (req, res) => cookiesPolicyController.submitConfirmCookiesPolicy(req, res))

  return router
}
