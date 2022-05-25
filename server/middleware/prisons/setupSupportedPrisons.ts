import express, { Router } from 'express'
import authorisationMiddleware from '../authorisationMiddleware'
import SupportedPrisonsController from '../../routes/prisons/SupportedPrisonsController'
import SupportedPrisonsService from '../../services/prison/SupportedPrisonsService'

export default function setupSupportedPrisons(supportedPrisonsService: SupportedPrisonsService): Router {
  const router = express.Router()

  const supportedPrisonsController = new SupportedPrisonsController(supportedPrisonsService)

  router.use('/', authorisationMiddleware(['ROLE_SLM_ADMIN']))
  router.get('/', (req, res) => supportedPrisonsController.getSupportedPrisonsView(req, res))
  router.post('/add', (req, res) => supportedPrisonsController.addSupportedPrison(req, res))
  router.get('/remove/:prisonId', (req, res) => supportedPrisonsController.removeSupportedPrison(req, res))

  return router
}
