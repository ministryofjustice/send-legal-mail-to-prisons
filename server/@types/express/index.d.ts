import type { RecipientForm } from 'forms'
import {
  BarcodeEntryForm,
  ChooseBarcodeOptionForm,
  ChooseContactForm,
  CreateNewContactByPrisonNumberForm,
  FindRecipientByPrisonNumberForm,
  PdfForm,
  RequestLinkForm,
} from '../forms'
import { Recipient } from '../prisonTypes'
import { Contact } from '../sendLegalMailApiClient'

export default {}

declare module 'express-session' {
  // Declare that the session will potentially contain these additional fields
  interface SessionData {
    returnTo: string
    nowInMinutes: number
    requestLinkForm: RequestLinkForm
    slmToken: string
    validSlmToken: boolean
    barcodeUserEmail: string
    findRecipientByPrisonNumberForm: FindRecipientByPrisonNumberForm
    createNewContactByPrisonNumberForm: CreateNewContactByPrisonNumberForm
    barcodeEntryForm: BarcodeEntryForm
    scannedAtLeastOneBarcode: boolean
    recipients: Array<Recipient>
    chooseBarcodeOptionForm: ChooseBarcodeOptionForm
    pdfForm: PdfForm
    findRecipientByPrisonerNameForm: FindRecipientByPrisonerNameForm
    createNewContactByPrisonerNameForm: CreateNewContactByPrisonerNameForm
    chooseContactForm: ChooseContactForm
    contactSearchResults: Array<Contact>
    recipientForm: RecipientForm
  }
}

export declare global {
  namespace Express {
    interface User {
      username: string
      token: string
      authSource: string
    }

    interface Request {
      verified?: boolean
      flash(type: string, message: Array<Record<string, string>>): number
      flash(message: 'errors'): Array<Record<string, string>>
    }

    interface Response {
      renderPDF(view: string, pageData: Record<string, unknown>, options?: Record<string, unknown>): void
    }
  }
}
