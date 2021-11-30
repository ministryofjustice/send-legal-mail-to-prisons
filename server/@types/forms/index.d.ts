declare module 'forms' {
  export interface RequestLinkForm {
    email?: string
  }

  export interface FindRecipientForm {
    prisonerNameOrNumber?: string
  }

  export interface ScanBarcodeForm {
    barcode?: string
  }
}
