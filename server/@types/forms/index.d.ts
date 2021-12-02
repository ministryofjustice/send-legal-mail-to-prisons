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
  export interface ManualEntryBarcodeForm {
    barcodeElement1?: string
    barcodeElement2?: string
    barcodeElement3?: string
  }
}
