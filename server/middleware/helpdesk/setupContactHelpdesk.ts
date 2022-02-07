import express, { Router } from 'express'
import ContactHelpdeskController from '../../routes/helpdesk/ContactHelpdeskController'

export default function setupContactHelpdesk(): Router {
  const router = express.Router()
  const contactHelpdeskController = new ContactHelpdeskController()

  router.get('/', (req, res) => contactHelpdeskController.getContactHelpdeskView(req, res))
  router.post('/', (req, res) => contactHelpdeskController.submitContactHelpdesk(req, res))
  router.get('/submitted', (req, res) => contactHelpdeskController.getContactHelpdeskSubmittedView(req, res))

  return router
}
