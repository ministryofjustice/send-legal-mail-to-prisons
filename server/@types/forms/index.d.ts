declare module 'forms' {
  import type { CheckBarcodeErrorCodes } from '../sendLegalMailApiClientTypes'

  export interface RequestLinkForm {
    email?: string
  }

  export interface FindRecipientByPrisonNumberForm {
    prisonNumber?: string
  }

  export interface FindRecipientByPrisonerNameForm {
    prisonerName?: string
    contacts?: Array<ContactResponse>
  }

  export interface CreateNewContactByPrisonNumberForm {
    prisonNumber: string
    prisonerName?: string
    prisonId?: string
  }

  export interface CreateNewContactByPrisonerNameForm {
    prisonerName: string
    prisonId?: string
    prisonerDob?: Date
    'prisonerDob-day'?: string
    'prisonerDob-month'?: string
    'prisonerDob-year'?: string
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

  export type RadioButtonOption = {
    value: string
    html?: string
    text?: string
    checked: boolean
  }

  export interface ChooseContactForm {
    contactId?: string
  }
}
