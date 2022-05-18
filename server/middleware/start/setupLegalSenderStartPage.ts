import express, { Router } from 'express'
import StartPageController from '../../routes/start/StartPageController'
import PrisonRegisterService from '../../services/prison/PrisonRegisterService'

export default function setupLegalSenderStartPage(prisonRegisterService: PrisonRegisterService): Router {
  const router = express.Router()
  const startPageController = new StartPageController(prisonRegisterService)

  router.get('/', (req, res) => startPageController.getStartPageView(req, res))

  return router
}
