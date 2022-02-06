import express, { Router } from 'express'
import ContactHelpdeskController from '../../routes/helpdesk/ContactHelpdeskController'

export default function setupContactHelpdesk(): Router {
  const router = express.Router()
  const contactHelpdeskController = new ContactHelpdeskController()

  router.get('/', (req, res) => contactHelpdeskController.getContactHelpdeskView(req, res))

  return router
}
