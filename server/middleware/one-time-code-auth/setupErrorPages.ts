import express, { Router } from 'express'

export default function setupErrorPages(): Router {
  const router = express.Router()

  router.get('/start-again', (req, res) => res.render('pages/one-time-code-auth/startAgain'))
  router.get('/code-no-longer-valid', (req, res) => res.render('pages/one-time-code-auth/codeNoLongerValid'))

  return router
}
