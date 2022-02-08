import express, { Router } from 'express'
import multer from 'multer'
import ContactHelpdeskController from '../../routes/helpdesk/ContactHelpdeskController'

export default function setupContactHelpdesk(): Router {
  const router = express.Router()
  const contactHelpdeskController = new ContactHelpdeskController()

  const upload = multer({ dest: 'uploads/', limits: { files: 1, fileSize: 20 * 1024 * 1024 } })

  router.get('/', (req, res) => contactHelpdeskController.getContactHelpdeskView(req, res))
  router.post('/', upload.single('screenshot'), (req, res) => contactHelpdeskController.submitContactHelpdesk(req, res))
  router.get('/submitted', (req, res) => contactHelpdeskController.getContactHelpdeskSubmittedView(req, res))

  return router
}
