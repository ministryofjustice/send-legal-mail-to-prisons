import express, { Router } from 'express'

export default function setupLegalSenderStartPage(): Router {
  const router = express.Router()

  router.get('/', (req, res) => res.render('pages/start/legal-sender-start-page'))

  return router
}
