import express, { Router } from 'express'
import StartPageController from '../../routes/start/StartPageController'
import PrisonService from '../../services/prison/PrisonService'

export default function setupLegalSenderStartPage(prisonService: PrisonService): Router {
  const router = express.Router()
  const startPageController = new StartPageController(prisonService)

  router.get('/', (req, res) => startPageController.getStartPageView(req, res))

  return router
}
