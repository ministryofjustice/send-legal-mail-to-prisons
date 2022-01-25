import {
  BarcodeEntryForm,
  ChooseBarcodeOptionForm,
  CreateNewContactForm,
  FindRecipientForm,
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
    createBarcodeAuthToken: string
    validCreateBarcodeAuthToken: boolean
    barcodeUserEmail: string
    findRecipientForm: FindRecipientForm
    createNewContactForm: CreateNewContactForm
    barcodeEntryForm: BarcodeEntryForm
    scannedAtLeastOneBarcode: boolean
    recipients: Array<Recipient>
    chooseBarcodeOptionForm: ChooseBarcodeOptionForm
    pdfForm: PdfForm
    findRecipientByPrisonerNameForm: FindRecipientByPrisonerNameForm
    createNewContactByPrisonerNameForm: CreateNewContactByPrisonerNameForm
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
