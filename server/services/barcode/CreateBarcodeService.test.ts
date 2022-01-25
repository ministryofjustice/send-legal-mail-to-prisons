// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { toBuffer } from 'bwip-js'
import nock from 'nock'
import CreateBarcodeService from './CreateBarcodeService'
import config from '../../config'

jest.mock('bwip-js')
const mockBwipjsToBuffer = <jest.Mock<typeof toBuffer>>toBuffer

describe('CreateBarcodeService', () => {
  const createBarcodeService = new CreateBarcodeService()
  let mockedSendLegalMailApi: nock.Scope

  beforeEach(() => {
    mockedSendLegalMailApi = nock(config.apis.sendLegalMail.url)
    mockBwipjsToBuffer.mockClear()
  })

  afterEach(() => {
    nock.cleanAll()
  })

  describe('generateBarcodeValue', () => {
    it('should generate a new barcode value', async () => {
      mockedSendLegalMailApi.post('/barcode').reply(201, { barcode: '123456789012' })

      const barcodeValue = await createBarcodeService.generateBarcodeValue('some-token')

      expect(barcodeValue).toBe('123456789012')
    })

    it('should throw error if calling the API returns error', async () => {
      mockedSendLegalMailApi.post('/barcode').reply(400, 'something bad happened')

      try {
        await createBarcodeService.generateBarcodeValue('some-token')
        fail('Was expecting createBarcodeService.generateBarcodeValue to have thrown an error but it did not')
      } catch (error) {
        expect(error).toStrictEqual(new Error('Error generating new barcode value'))
      }
    })
  })

  describe('generateAddressAndBarcodeDataUrlImage', () => {
    it('should generate an address and barcode data url image', async () => {
      const recipient = {
        prisonNumber: 'A1234BC',
        prisonerName: 'John Smith',
        prisonAddress: {
          premise: 'HMP BRINSFORD',
          street: 'New Road',
          locality: 'Featherstone',
          area: 'Featherstone Wolverhampton',
          postalCode: 'WV10 7PY',
        },
        barcodeValue: '123456789012',
      }
      mockBwipjsToBuffer.mockResolvedValue(Buffer.from('barcode-image'))

      const barcodeImageDataUrl = await createBarcodeService.generateAddressAndBarcodeDataUrlImage(recipient)

      expect(barcodeImageDataUrl).toContain('data:image/png;base64,')
      expect(mockBwipjsToBuffer).toHaveBeenCalledWith(
        expect.objectContaining({ text: '123456789012', alttext: '1234-5678-9012' })
      )
    })

    it('should reject the promise given generating the barcode buffer fails', async () => {
      const recipient = {
        prisonNumber: 'A1234BC',
        prisonerName: 'John Smith',
        prisonAddress: {
          premise: 'HMP BRINSFORD',
          street: 'New Road',
          locality: 'Featherstone',
          area: 'Featherstone Wolverhampton',
          postalCode: 'WV10 7PY',
        },
        barcodeValue: '123456789012',
      }
      mockBwipjsToBuffer.mockRejectedValue('An error generating the barcode image')

      try {
        await createBarcodeService.generateAddressAndBarcodeDataUrlImage(recipient)
        fail(
          'Was expecting createBarcodeService.generateAddressAndBarcodeDataUrlImage to have thrown an error but it did not'
        )
      } catch (error) {
        expect(error).toBe('An error generating the barcode image')
        expect(mockBwipjsToBuffer).toHaveBeenCalledWith(
          expect.objectContaining({ text: '123456789012', alttext: '1234-5678-9012' })
        )
      }
    })
  })

  describe('addBarcodeValuesToRecipients', () => {
    it('should add barcode values to recipients', async () => {
      const recipients = [
        {
          prisonNumber: 'A1234BC',
          prisonerName: 'John Smith',
          prisonAddress: {
            premise: 'HMP BRINSFORD',
            postalCode: 'WV10 7PY',
          },
        },
        {
          prisonNumber: 'A5566JD',
          prisonerName: 'Jane Doe',
          prisonAddress: {
            premise: 'HMP Bristol',
            postalCode: 'BS1 1AA',
          },
          barcodeValue: '121212121212',
        },
        {
          prisonNumber: 'Q9876TY',
          prisonerName: 'Fred Bloggs',
          prisonAddress: {
            premise: 'HMP Bristol',
            postalCode: 'BS1 1AA',
          },
        },
      ]

      mockedSendLegalMailApi
        .post('/barcode')
        .reply(201, { barcode: '123456789012' })
        .post('/barcode')
        .reply(201, { barcode: '098765432109' })

      const recipientsWithBarcodes = await createBarcodeService.addBarcodeValuesToRecipients(recipients, 'some-token')

      expect(recipientsWithBarcodes).toStrictEqual([
        {
          prisonNumber: 'A1234BC',
          prisonerName: 'John Smith',
          prisonAddress: {
            premise: 'HMP BRINSFORD',
            postalCode: 'WV10 7PY',
          },
          barcodeValue: '123456789012',
        },
        {
          prisonNumber: 'A5566JD',
          prisonerName: 'Jane Doe',
          prisonAddress: {
            premise: 'HMP Bristol',
            postalCode: 'BS1 1AA',
          },
          barcodeValue: '121212121212',
        },
        {
          prisonNumber: 'Q9876TY',
          prisonerName: 'Fred Bloggs',
          prisonAddress: {
            premise: 'HMP Bristol',
            postalCode: 'BS1 1AA',
          },
          barcodeValue: '098765432109',
        },
      ])
    })

    it('should fail to add barcode values to recipients given barcode API fails for 2nd recipient', async () => {
      const recipients = [
        {
          prisonNumber: 'A1234BC',
          prisonerName: 'John Smith',
          prisonAddress: {
            premise: 'HMP BRINSFORD',
            postalCode: 'WV10 7PY',
          },
        },
        {
          prisonNumber: 'Q9876TY',
          prisonerName: 'Fred Bloggs',
          prisonAddress: {
            premise: 'HMP Bristol',
            postalCode: 'BS1 1AA',
          },
        },
      ]

      mockedSendLegalMailApi
        .post('/barcode')
        .reply(201, { barcode: '123456789012' })
        .post('/barcode')
        .reply(400, 'Some API error generating a new barcode number')

      try {
        await createBarcodeService.addBarcodeValuesToRecipients(recipients, 'some-token')
        fail('Was expecting createBarcodeService.addBarcodeValuesToRecipients to have thrown an error but it did not')
      } catch (error) {
        expect(error).toStrictEqual(new Error('Error generating new barcode value'))
      }
    })
  })

  describe('formatAddressContent', () => {
    const defaultAddress = {
      prisonNumber: 'A1234BC',
      prisonAddress: {
        premise: 'HMP Somewhere',
        street: 'A Street',
        locality: 'Town',
        postCode: 'SW1 1SW',
      },
    }
    it('should allow name of 30 characters or less', () => {
      const address = createBarcodeService.formatAddressContent({
        prisonerName: '123456789012345678901234567890',
        ...defaultAddress,
      })

      expect(address[0]).toStrictEqual('123456789012345678901234567890')
    })

    it('should include street if name is 30 characters or less', () => {
      const address = createBarcodeService.formatAddressContent({
        prisonerName: '123456789012345678901234567890',
        ...defaultAddress,
      })

      expect(address).toEqual(expect.arrayContaining([expect.stringMatching('A Street')]))
    })

    it('should hyphenate name of more than 30', () => {
      const address = createBarcodeService.formatAddressContent({
        prisonerName: '1234567890123456789012345678901',
        ...defaultAddress,
      })

      expect(address).toContain('123456789012345678901234567-')
      expect(address[1]).toStrictEqual('8901')
    })

    it('should not include street if name on 2 lines', () => {
      const address = createBarcodeService.formatAddressContent({
        prisonerName: '1234567890123456789012345678901',
        ...defaultAddress,
      })

      expect(address).not.toEqual(expect.arrayContaining([expect.stringMatching('A Street')]))
    })

    it('should hyphenate name of max length 60', () => {
      const address = createBarcodeService.formatAddressContent({
        prisonerName: '123456789012345678901234567890123456789012345678901234567890',
        ...defaultAddress,
      })

      expect(address[0]).toStrictEqual('123456789012345678901234567890-')
      expect(address[1]).toStrictEqual('123456789012345678901234567890')
    })

    it('should not hyphenate next to a space', () => {
      const address = createBarcodeService.formatAddressContent({
        prisonerName: '123456789012345678901234567890 23456789012345678901234567890',
        ...defaultAddress,
      })

      expect(address[0]).toStrictEqual('123456789012345678901234567890')
      expect(address[1]).toStrictEqual('23456789012345678901234567890')
    })

    it('should not hyphenate space up to 4 chars before 30 limit', () => {
      const address = createBarcodeService.formatAddressContent({
        prisonerName: '12345678901234567890123456 890123456789012345678901234567890',
        ...defaultAddress,
      })

      expect(address[0]).toStrictEqual('12345678901234567890123456')
      expect(address[1]).toStrictEqual('890123456789012345678901234567890')
    })

    it('should not hyphenate space up to 4 chars after 30 limit', () => {
      const address = createBarcodeService.formatAddressContent({
        prisonerName: '123456789012345678901234567890123 56789012345678901234567890',
        ...defaultAddress,
      })

      expect(address[0]).toStrictEqual('123456789012345678901234567890123')
      expect(address[1]).toStrictEqual('56789012345678901234567890')
    })

    it('should not hyphenate small 2nd name just before 30 limit', () => {
      const address = createBarcodeService.formatAddressContent({
        prisonerName: '12345678901234567890123456 de 123456789012345678901234567890',
        ...defaultAddress,
      })

      expect(address[0]).toStrictEqual('12345678901234567890123456')
      expect(address[1]).toStrictEqual('de 123456789012345678901234567890')
    })

    it('should not hyphenate small 2nd name just after 30 limit', () => {
      const address = createBarcodeService.formatAddressContent({
        prisonerName: '1234567890123456789012345678901 de 6789012345678901234567890',
        ...defaultAddress,
      })

      expect(address[0]).toStrictEqual('1234567890123456789012345678901')
      expect(address[1]).toStrictEqual('de 6789012345678901234567890')
    })
  })
})
