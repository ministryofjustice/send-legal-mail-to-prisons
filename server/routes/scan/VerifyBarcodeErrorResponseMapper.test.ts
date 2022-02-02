import type { DuplicateErrorCode, RandomCheckErrorCode } from 'sendLegalMailApiClient'
import PrisonRegisterService from '../../services/prison/PrisonRegisterService'
import VerifyBarcodeErrorResponseMapper from './VerifyBarcodeErrorResponseMapper'

describe('VerifyBarcodeErrorResponseMapper', () => {
  const prisonRegisterService = {
    getPrisonNameOrId: jest.fn(),
  }

  const verifyBarcodeErrorResponseMapper = new VerifyBarcodeErrorResponseMapper(
    prisonRegisterService as unknown as PrisonRegisterService
  )

  afterEach(() => {
    prisonRegisterService.getPrisonNameOrId.mockReset()
  })

  describe('mapErrorResponse', () => {
    it('should map Duplicate', () => {
      const apiErrorCode = {
        code: 'DUPLICATE',
        userMessage: 'Barcode scanned at ACI',
        scannedLocation: 'ACI',
      } as DuplicateErrorCode
      const apiErrorResponse = {
        status: 400,
        data: {
          status: 400,
          errorCode: apiErrorCode,
        },
      }
      prisonRegisterService.getPrisonNameOrId.mockReturnValue('HMP Altcourse')

      const errorCode = verifyBarcodeErrorResponseMapper.mapErrorResponse(apiErrorResponse)

      expect(errorCode).toStrictEqual({
        code: 'DUPLICATE',
        userMessage: 'Barcode scanned at ACI',
        scannedLocation: 'HMP Altcourse',
      })
      expect(prisonRegisterService.getPrisonNameOrId).toHaveBeenCalledWith('ACI')
    })

    it('should map Expired', () => {
      const apiErrorCode = {
        code: 'EXPIRED',
        userMessage: 'Barcode expired',
      }
      const apiErrorResponse = {
        status: 400,
        data: {
          status: 400,
          errorCode: apiErrorCode,
        },
      }

      const errorCode = verifyBarcodeErrorResponseMapper.mapErrorResponse(apiErrorResponse)

      expect(errorCode).toStrictEqual(apiErrorCode)
    })

    it('should map RandomCheckErrorCode', () => {
      const apiErrorCode = {
        code: 'RANDOM_CHECK',
        userMessage: 'Random check required',
      } as RandomCheckErrorCode
      const apiErrorResponse = {
        status: 400,
        data: {
          status: 400,
          errorCode: apiErrorCode,
        },
      }

      const errorCode = verifyBarcodeErrorResponseMapper.mapErrorResponse(apiErrorResponse)

      expect(errorCode).toStrictEqual(apiErrorCode)
    })

    it('should map NOT_FOUND', () => {
      const apiErrorResponse = {
        status: 404,
      }

      const errorCode = verifyBarcodeErrorResponseMapper.mapErrorResponse(apiErrorResponse)

      expect(errorCode).toStrictEqual({ code: 'NOT_FOUND' })
    })

    it('should throw error for unsupported api error code', () => {
      const apiErrorCode = {
        code: 'SOME_OTHER_ERROR_TYPE',
        userMessage: 'Some other error type',
      }
      const apiErrorResponse = {
        status: 400,
        data: {
          status: 400,
          errorCode: apiErrorCode,
        },
      }

      expect(() => verifyBarcodeErrorResponseMapper.mapErrorResponse(apiErrorResponse)).toThrowError(
        'Unsupported error code SOME_OTHER_ERROR_TYPE'
      )
    })
  })
})
