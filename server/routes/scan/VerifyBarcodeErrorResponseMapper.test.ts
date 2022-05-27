import type { DuplicateErrorCode, RandomCheckErrorCode } from 'sendLegalMailApiClient'
import VerifyBarcodeErrorResponseMapper from './VerifyBarcodeErrorResponseMapper'
import PrisonService from '../../services/prison/PrisonService'

describe('VerifyBarcodeErrorResponseMapper', () => {
  const prisonService = {
    getPrisonNameOrId: jest.fn(),
  }

  const verifyBarcodeErrorResponseMapper = new VerifyBarcodeErrorResponseMapper(
    prisonService as unknown as PrisonService
  )

  afterEach(() => {
    prisonService.getPrisonNameOrId.mockReset()
  })

  describe('mapErrorResponse', () => {
    it('should map Duplicate', async () => {
      const apiErrorCode = {
        code: 'DUPLICATE',
        userMessage: 'Barcode scanned at ACI',
        scannedLocation: 'ACI',
        recipientName: 'Joe Spice',
        recipientPrisonNumber: 'A1234BC',
        recipientDob: '1990-01-31',
      } as DuplicateErrorCode
      const apiErrorResponse = {
        status: 400,
        data: {
          status: 400,
          errorCode: apiErrorCode,
        },
      }
      prisonService.getPrisonNameOrId.mockReturnValue('HMP Altcourse')

      const errorCode = await verifyBarcodeErrorResponseMapper.mapErrorResponse(apiErrorResponse)

      expect(errorCode).toStrictEqual({
        code: 'DUPLICATE',
        userMessage: 'Barcode scanned at ACI',
        scannedLocation: 'HMP Altcourse',
        recipientName: 'Joe Spice',
        recipientPrisonNumber: 'A1234BC',
        recipientDob: '1990-01-31',
      })
      expect(prisonService.getPrisonNameOrId).toHaveBeenCalledWith('ACI')
    })

    it('should map Expired', async () => {
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

      const errorCode = await verifyBarcodeErrorResponseMapper.mapErrorResponse(apiErrorResponse)

      expect(errorCode).toStrictEqual(apiErrorCode)
    })

    it('should map RandomCheckErrorCode', async () => {
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

      const errorCode = await verifyBarcodeErrorResponseMapper.mapErrorResponse(apiErrorResponse)

      expect(errorCode).toStrictEqual(apiErrorCode)
    })

    it('should map NOT_FOUND', async () => {
      const apiErrorResponse = {
        status: 404,
      }

      const errorCode = await verifyBarcodeErrorResponseMapper.mapErrorResponse(apiErrorResponse)

      expect(errorCode).toStrictEqual({ code: 'NOT_FOUND' })
    })

    it('should throw error for unsupported api error code', async () => {
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

      try {
        await verifyBarcodeErrorResponseMapper.mapErrorResponse(apiErrorResponse)
      } catch (error) {
        expect(error).toEqual(new Error('Unsupported error code SOME_OTHER_ERROR_TYPE'))
      }
    })
  })
})
