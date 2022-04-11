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
  export type VerifyCodeRequest = components['schemas']['VerifyCodeRequest']
  export type VerifyCodeResponse = components['schemas']['VerifyCodeResponse']
  export type OneTimeCodeRequest = components['schemas']['OneTimeCodeRequest']
  export type CreateBarcodeRequest = components['schemas']['CreateBarcodeRequest']
  export type CreateBarcodeResponse = components['schemas']['CreateBarcodeResponse']
  export type CheckBarcodeRequest = components['schemas']['CheckBarcodeRequest']
  export type CheckBarcodeResponse = components['schemas']['CheckBarcodeResponse']

  export type ContactRequest = components['schemas']['ContactRequest']
  export type Contact = components['schemas']['ContactResponse']

  export type CjsmUserDetails = components['schemas']['UserDetails']
}
