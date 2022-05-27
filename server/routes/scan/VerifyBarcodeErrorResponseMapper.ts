import type { DuplicateErrorCode, ErrorCode, ErrorResponse } from 'sendLegalMailApiClient'
import PrisonService from '../../services/prison/PrisonService'

export default class VerifyBarcodeErrorResponseMapper {
  constructor(private readonly prisonService: PrisonService) {}

  mapErrorResponse = async (apiErrorResponse: { data?: ErrorResponse; status?: number }): ErrorCode => {
    const errorType = apiErrorResponse.data?.errorCode?.code
    if (errorType === 'DUPLICATE') {
      const { scannedLocation } = apiErrorResponse.data.errorCode as DuplicateErrorCode
      const prisonName = await this.prisonService.getPrisonNameOrId(scannedLocation)
      return {
        ...apiErrorResponse.data.errorCode,
        scannedLocation: prisonName,
      } as DuplicateErrorCode
    }
    if (errorType === 'RANDOM_CHECK' || errorType === 'EXPIRED') {
      return apiErrorResponse.data.errorCode
    }
    if (apiErrorResponse.status === 404) {
      return { code: 'NOT_FOUND' } as ErrorCode
    }

    throw new Error(`Unsupported error code ${errorType}`)
  }
}
