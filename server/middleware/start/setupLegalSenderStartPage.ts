import express, { Router } from 'express'
import StartPageController from '../../routes/start/StartPageController'

export default function setupLegalSenderStartPage(): Router {
  const router = express.Router()
  const startPageController = new StartPageController()

  router.get('/', (req, res) => startPageController.getStartPageView(req, res))

  return router
}
