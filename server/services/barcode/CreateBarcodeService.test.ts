// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { toBuffer } from 'bwip-js'
import CreateBarcodeService from './CreateBarcodeService'

jest.mock('bwip-js')
const mockBwipjsToBuffer = <jest.Mock<typeof toBuffer>>toBuffer

describe('CreateBarcodeService', () => {
  let createBarcodeService: CreateBarcodeService

  beforeEach(() => {
    createBarcodeService = new CreateBarcodeService()
  })

  describe('generateBarcodeImage', () => {
    beforeEach(() => {
      mockBwipjsToBuffer.mockClear()
    })

    it('should pass the barcode into the barcode generator', async () => {
      const response = await createBarcodeService.generateBarcodeImage('somebarcode1')

      expect(mockBwipjsToBuffer).toHaveBeenCalledWith(
        expect.objectContaining({ text: 'somebarcode1', alttext: 'some-barc-ode1' })
      )
    })
  })
})
