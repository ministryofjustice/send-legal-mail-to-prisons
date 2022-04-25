declare module 'prisonTypes' {
  export type Prison = {
    id: string
    name?: string
    addressName?: string
    street?: string
    locality?: string
    postalCode?: string
  }

  export type Recipient = {
    prisonNumber?: string
    prisonerName: string
    prisonerDob?: Date
    prison: Prison
    barcodeValue?: string
    contactId?: number
  }
}
