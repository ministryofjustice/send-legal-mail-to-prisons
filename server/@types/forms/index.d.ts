declare module 'forms' {
  export interface RequestLinkForm {
    email?: string
  }

  export interface FindRecipientForm {
    prisonerNameOrNumber?: string
  }

  export interface BarcodeEntryForm {
    barcode?: string
  }
}
