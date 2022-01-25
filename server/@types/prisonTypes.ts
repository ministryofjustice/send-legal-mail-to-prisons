export type Prison = {
  id: string
  name: string
}

export type PrisonAddress = {
  agencyCode?: string
  agyDescription?: string
  flat?: string
  premise?: string
  street?: string
  locality?: string
  countyCode?: string
  area?: string
  postalCode?: string
}

export type Recipient = {
  prisonNumber?: string
  prisonerName: string
  prisonerDob?: string
  prisonAddress: PrisonAddress
  barcodeValue?: string
}
