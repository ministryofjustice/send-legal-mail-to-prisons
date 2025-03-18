import { Request, Response } from 'express'
import FindRecipientByPrisonNumberView from './FindRecipientByPrisonNumberView'
import FindRecipientByPrisonerNameView from './FindRecipientByPrisonerNameView'
import validatePrisonNumber from '../validators/prisonNumberValidator'
import validatePrisonerName from '../validators/prisonerNameValidator'
import formatErrors from '../../errorFormatter'
import RecipientFormService from './RecipientFormService'
import ContactService from '../../../services/contacts/ContactService'
import logger from '../../../../logger'

export default class FindRecipientController {
  constructor(
    private readonly recipientFormService: RecipientFormService,
    private readonly contactService: ContactService,
  ) {}

  async getFindRecipientByPrisonNumberView(req: Request, res: Response): Promise<void> {
    req.session.pdfRecipients = undefined
    this.recipientFormService.resetForm(req)
    const view = new FindRecipientByPrisonNumberView(
      req.session?.findRecipientByPrisonNumberForm || {},
      req.flash('errors'),
    )
    return res.render('pages/barcode/find-recipient-by-prison-number', { ...view.renderArgs })
  }

  async submitFindByPrisonNumber(req: Request, res: Response): Promise<void> {
    req.body.prisonNumber = req.body.prisonNumber.trim().toUpperCase()
    req.session.findRecipientByPrisonNumberForm = { ...req.body }
    const errors = validatePrisonNumber(req.body.prisonNumber)
    if (errors.length > 0) {
      req.flash('errors', formatErrors('prisonNumber', errors))
      return res.redirect('/barcode/find-recipient/by-prison-number')
    }

    req.session.recipientForm.prisonNumber = req.session.findRecipientByPrisonNumberForm.prisonNumber
    req.session.findRecipientByPrisonNumberForm = undefined
    try {
      const contact = await this.contactService.getContactByPrisonNumber(
        req.session.barcodeUser.token,
        req.ip,
        req.session.recipientForm.prisonNumber,
      )
      if (contact) {
        await this.recipientFormService.addContact(req, contact)
        req.session.chooseContactForm = undefined
        return res.redirect('/barcode/review-recipients')
      }
    } catch (error) {
      logger.error(`Failed to look for an existing contact due to error:`, error)
      req.flash('errors', [{ text: 'There was a problem searching your saved contacts - please create again.' }])
      return res.redirect('/barcode/find-recipient/create-new-contact/by-prison-number')
    }
    return res.redirect('/barcode/find-recipient/create-new-contact/by-prison-number')
  }

  async getFindRecipientByPrisonerNameView(req: Request, res: Response): Promise<void> {
    req.session.pdfRecipients = undefined
    this.recipientFormService.resetForm(req)
    const view = new FindRecipientByPrisonerNameView(
      req.session?.findRecipientByPrisonerNameForm || {},
      req.flash('errors'),
    )
    return res.render('pages/barcode/find-recipient-by-prisoner-name', { ...view.renderArgs })
  }

  async submitFindByPrisonerName(req: Request, res: Response): Promise<void> {
    req.body.prisonerName = req.body.prisonerName.trim()
    req.session.findRecipientByPrisonerNameForm = { ...req.body }
    const errors = validatePrisonerName(req.body.prisonerName)
    if (errors.length > 0) {
      req.flash('errors', formatErrors('prisonerName', errors))
      return res.redirect('/barcode/find-recipient/by-prisoner-name')
    }

    req.session.recipientForm.prisonerName = req.session.findRecipientByPrisonerNameForm.prisonerName
    req.session.recipientForm.searchName = req.session.findRecipientByPrisonerNameForm.prisonerName
    req.session.findRecipientByPrisonerNameForm = undefined
    try {
      const contacts = await this.contactService.searchContacts(
        req.session.barcodeUser.token,
        req.ip,
        req.session.recipientForm.prisonerName,
      )
      if (contacts.length > 0) {
        req.session.recipientForm.contacts = contacts
        return res.redirect('/barcode/find-recipient/choose-contact')
      }
    } catch (error) {
      logger.error(`Failed to search for existing contacts due to error:`, error)
      req.flash('errors', [{ text: 'There was a problem searching your saved contacts - please create again.' }])
      return res.redirect('/barcode/find-recipient/create-new-contact/by-prisoner-name')
    }
    return res.redirect('/barcode/find-recipient/create-new-contact/by-prisoner-name')
  }
}
