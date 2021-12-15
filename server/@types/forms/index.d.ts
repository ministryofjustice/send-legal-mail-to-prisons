declare module 'forms' {
  import type { CheckBarcodeErrorCodes } from '../sendLegalMailApiClientTypes'

  export interface RequestLinkForm {
    email?: string
  }

  export interface FindRecipientForm {
    prisonerNameOrNumber?: string
  }

  export interface BarcodeEntryForm {
    barcode?: string
    createdBy?: string
    errorCode?: CheckBarcodeErrorCodes
  }
}
