import express, { Router } from 'express'
import multer from 'multer'
import ContactHelpdeskController from '../../routes/helpdesk/ContactHelpdeskController'
import { MAX_FILE_SIZE } from '../../routes/helpdesk/validators/uploadValidator'
import config from '../../config'
import ZendeskService from '../../services/helpdesk/ZendeskService'

export default function setupContactHelpdesk(zendeskService: ZendeskService): Router {
  const router = express.Router()
  const contactHelpdeskController = new ContactHelpdeskController(zendeskService)

  router.get('/', (req, res) => contactHelpdeskController.getContactHelpdeskView(req, res))

  if (config.featureFlags.fileUploadsEnabled) {
    const upload = multer({ dest: 'uploads/', limits: { files: 1, fileSize: MAX_FILE_SIZE } })
    router.post('/', upload.single('screenshot'), (req, res) =>
      contactHelpdeskController.submitContactHelpdesk(req, res)
    )
  } else {
    router.post('/', (req, res) => contactHelpdeskController.submitContactHelpdesk(req, res))
  }

  router.get('/submitted', (req, res) => contactHelpdeskController.getContactHelpdeskSubmittedView(req, res))

  return router
}
