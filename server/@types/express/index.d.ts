import type { EditContactForm, RecipientForm } from 'forms'
import {
  BarcodeEntryForm,
  ChooseBarcodeOptionForm,
  ChooseContactForm,
  ContactHelpdeskForm,
  CreateNewContactByPrisonNumberForm,
  FindRecipientByPrisonNumberForm,
  PdfForm,
  RequestLinkForm,
} from '../forms'
import { Recipient } from '../prisonTypes'

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
    barcodeUserOrganisation: string
    findRecipientByPrisonNumberForm: FindRecipientByPrisonNumberForm
    createNewContactByPrisonNumberForm: CreateNewContactByPrisonNumberForm
    barcodeEntryForm: BarcodeEntryForm
    scannedAtLeastOneBarcode: boolean
    recipients: Array<Recipient>
    pdfRecipients: Array<Recipient>
    chooseBarcodeOptionForm: ChooseBarcodeOptionForm
    pdfForm: PdfForm
    findRecipientByPrisonerNameForm: FindRecipientByPrisonerNameForm
    createNewContactByPrisonerNameForm: CreateNewContactByPrisonerNameForm
    chooseContactForm: ChooseContactForm
    recipientForm: RecipientForm
    cookiesPolicy: CookiesPolicy
    contactHelpdeskForm: ContactHelpdeskForm
    editContactForm: EditContactForm
    msjSmokeTestUser: boolean
  }

  export interface CookiesPolicy {
    policy: 'accept' | 'reject' | 'n/a' | undefined
    showConfirmation: boolean
    lastPage: string
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
