declare module 'sendLegalMailApiClient' {
  import { components } from '../sendLegalMailApi'

  export type ErrorResponse = components['schemas']['ErrorResponse']
  export type ErrorCode = components['schemas']['ErrorCode']
  export type CheckBarcodeErrorCodes = components['schemas']['CheckBarcodeErrorCodes']
  export type DuplicateErrorCode = components['schemas']['Duplicate']
  export type RandomCheckErrorCode = components['schemas']['RandomCheck']

  export type VerifyLinkRequest = components['schemas']['VerifyLinkRequest']
  export type VerifyLinkResponse = components['schemas']['VerifyLinkResponse']
  export type MagicLinkRequest = components['schemas']['MagicLinkRequest']
  export type CreateBarcodeRequest = components['schemas']['CreateBarcodeRequest']
  export type CreateBarcodeResponse = components['schemas']['CreateBarcodeResponse']
  export type CheckBarcodeRequest = components['schemas']['CheckBarcodeRequest']
  export type CheckBarcodeResponse = components['schemas']['CheckBarcodeResponse']

  export type CreateContactRequest = components['schemas']['CreateContactRequest']
  export type Contact = components['schemas']['ContactResponse']
}
