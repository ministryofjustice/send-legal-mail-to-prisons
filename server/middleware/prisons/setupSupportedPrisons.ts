import express, { Router } from 'express'
import authorisationMiddleware from '../authorisationMiddleware'
import SupportedPrisonsController from '../../routes/prisons/SupportedPrisonsController'

export default function setupSupportedPrisons(): Router {
  const router = express.Router()

  const supportedPrisonsController = new SupportedPrisonsController()

  router.use('/', authorisationMiddleware(['ROLE_SLM_ADMIN']))
  router.get('/', (req, res) => supportedPrisonsController.getSupportedPrisonsView(req, res))

  return router
}
