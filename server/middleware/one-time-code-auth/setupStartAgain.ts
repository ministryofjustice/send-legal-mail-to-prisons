import express, { Router } from 'express'

export default function setupStartAgain(): Router {
  const router = express.Router()

  router.get('/start-again', (req, res) => res.render('pages/one-time-code-auth/startAgain'))

  return router
}
