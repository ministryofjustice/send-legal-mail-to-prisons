import type { EditContactForm, RecipientForm, RequestOneTimeCodeForm } from 'forms'
import type { CjsmUserDetails } from 'sendLegalMailApiClient'
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

export default {}

declare module 'express-session' {
  // Declare that the session will potentially contain these additional fields
  interface SessionData {
    returnTo: string
    nowInMinutes: number
    requestLinkForm: RequestLinkForm
    requestOneTimeCodeForm: RequestOneTimeCodeForm
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
    reviewRecipientsForm: ReviewRecipientsForm
    cookiesPolicy: CookiesPolicy
    editContactForm: EditContactForm
    msjSmokeTestUser: boolean
    lsjSmokeTestUser: boolean
    barcodeUser: BarcodeUser
  }

  export interface CookiesPolicy {
    policy: 'accept' | 'reject' | 'n/a' | undefined
    showConfirmation: boolean
    lastPage: string
  }

  export interface BarcodeUser {
    email?: string
    cjsmDetails?: CjsmUserDetails
    token?: string
    tokenValid: boolean
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
      logout(done: (err: unknown) => void): void
      flash(type: string, message: Array<Record<string, string>>): number
      flash(message: 'errors'): Array<Record<string, string>>
      id: string
    }

    interface Response {
      renderPDF(view: string, pageData: Record<string, unknown>, options?: Record<string, unknown>): void
    }
  }
}
