declare module 'forms' {
  import type { CheckBarcodeErrorCodes } from '../sendLegalMailApiClientTypes'

  export interface RequestLinkForm {
    email?: string
  }

  export interface FindRecipientForm {
    prisonNumber?: string
  }

  export interface CreateNewContactForm {
    prisonNumber: string
    prisonerName?: string
    prisonId?: string
  }

  export interface BarcodeEntryForm {
    barcode?: string
    createdBy?: string
    errorCode?: CheckBarcodeErrorCodes
  }

  export interface ChooseBarcodeOptionForm {
    barcodeOption?: 'coversheet' | 'image'
  }

  export interface PdfForm {
    envelopeSize?: 'dl' | 'c4' | 'c5'
  }
}
