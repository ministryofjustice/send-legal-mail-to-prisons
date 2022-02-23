import { Request } from 'express'
import type { Recipient } from 'prisonTypes'
import type { Contact } from 'sendLegalMailApiClient'
import moment from 'moment'
import type { RecipientForm } from 'forms'
import PrisonRegisterService from '../../../services/prison/PrisonRegisterService'

export default class RecipientFormService {
  constructor(private readonly prisonRegisterService: PrisonRegisterService) {}

  resetForm(req: Request) {
    req.session.recipientForm = {}
  }

  requiresName(req: Request): string | undefined {
    if ((req.session.recipientForm?.prisonerName?.trim() ?? '') === '') {
      return '/barcode/find-recipient'
    }
    return undefined
  }

  requiresPrisonNumber(req: Request): string | undefined {
    if ((req.session.recipientForm?.prisonNumber?.trim() ?? '') === '') {
      return '/barcode/find-recipient/by-prison-number'
    }
    return undefined
  }

  requiresContacts(req: Request): string | undefined {
    if ((req.session.recipientForm?.contacts ?? []).length === 0) {
      return '/barcode/find-recipient/by-prisoner-name'
    }
    return undefined
  }

  async addRecipient(req: Request, recipientForm: RecipientForm = req.session.recipientForm) {
    if (!req.session.recipients) {
      req.session.recipients = []
    }
    const newRecipient = await this.toRecipient(recipientForm)

    req.session.recipients.push(newRecipient)

    req.session.recipientForm = {}
  }

  private async updateRecipient(req: Request, recipientForm: RecipientForm) {
    if (!req.session.recipients) {
      req.session.recipients = []
    }

    const newRecipient = await this.toRecipient(recipientForm)

    req.session.recipients = req.session.recipients.map(recipient =>
      recipient.contactId !== newRecipient.contactId ? recipient : newRecipient
    )
  }

  async addContact(req: Request, contact: Contact) {
    const recipientForm = await this.toRecipientForm(contact)
    await this.addRecipient(req, recipientForm)
  }

  async updateContact(req: Request, contact: Contact) {
    const recipientForm = await this.toRecipientForm(contact)
    await this.updateRecipient(req, recipientForm)
  }

  private async toRecipient(recipientForm: RecipientForm): Promise<Recipient> {
    const prisonAddress = await this.prisonRegisterService.getPrisonAddress(recipientForm.prisonId)
    return {
      prisonerName: recipientForm.prisonerName || '',
      prisonNumber: recipientForm.prisonNumber,
      prisonerDob: recipientForm.prisonerDob,
      prisonAddress,
      contactId: +recipientForm.contactId || undefined,
    }
  }

  private async toRecipientForm(contact: Contact): Promise<RecipientForm> {
    return {
      prisonNumber: contact.prisonNumber,
      prisonerName: contact.prisonerName,
      prisonerDob: contact.dob ? moment(contact.dob, 'YYYY-MM-DD').toDate() : undefined,
      prisonId: contact.prisonId,
      contactId: contact.id,
    } as RecipientForm
  }
}
