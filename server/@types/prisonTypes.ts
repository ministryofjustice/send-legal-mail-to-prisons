export type Prison = {
  id: string
  name: string
}

export type PrisonAddress = {
  flat?: string
  premise?: string
  street?: string
  locality?: string
  countyCode?: string
  area?: string
  postalCode?: string
}

export type Recipient = {
  prisonNumber: string
  prisonerName: string
  prisonAddress: PrisonAddress
  barcodeValue?: string
}
