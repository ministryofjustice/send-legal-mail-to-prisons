declare module 'forms' {
  import type { CheckBarcodeErrorCodes } from '../sendLegalMailApiClient'
  import { PrisonAddress } from '../prisonTypes'
  import { Contact } from '../sendLegalMailApiClient'

  export interface RequestLinkForm {
    email?: string
  }

  export interface FindRecipientByPrisonNumberForm {
    prisonNumber?: string
  }

  export interface FindRecipientByPrisonerNameForm {
    prisonerName?: string
  }

  export interface CreateNewContactByPrisonNumberForm {
    readonly prisonNumber: string
    prisonerName?: string
    prisonId?: string
  }

  export interface CreateNewContactByPrisonerNameForm {
    readonly prisonerName: string
    prisonerDob?: Date
    'prisonerDob-day'?: string
    'prisonerDob-month'?: string
    'prisonerDob-year'?: string
    prisonId?: string
  }

  export interface BarcodeEntryForm {
    barcode?: string
    createdBy?: string
    errorCode?: CheckBarcodeErrorCodes
    lastScannedBarcode?: string
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

  export interface RecipientForm {
    prisonNumber?: string
    prisonerName?: string
    prisonerDob?: Date
    prisonId?: string
    prisonAddress?: PrisonAddress
    barcodeValue?: string
    searchName?: string
    contacts?: Array<Contact>
    contactId?: string
  }

  export interface ContactHelpdeskForm {
    pageId: string
    problemDetail?: string
    name?: string
    email?: string
  }

  export interface EditContactForm {
    name?: string
    prisonId?: string
    prisonNumber?: string
    dob?: Date
    'dob-day'?: string
    'dob-month'?: string
    'dob-year'?: string
  }
}
