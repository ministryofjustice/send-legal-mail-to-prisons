import { BarcodeEntryForm, FindRecipientForm, RequestLinkForm } from '../forms'

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
    barcodeEntryForm: BarcodeEntryForm
    barcode: string
    barcodeImageUrl: string
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
  }
}
