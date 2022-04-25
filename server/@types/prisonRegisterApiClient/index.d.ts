declare module 'prisonRegisterApiClient' {
  import { components } from '../prisonRegisterApi'

  export type ErrorResponse = components['schemas']['ErrorResponse']
  export type PrisonDto = components['schemas']['PrisonDto']
  export type AddressDto = components['schemas']['AddressDto']
}
