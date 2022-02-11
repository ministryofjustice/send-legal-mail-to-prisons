// TODO we cannot import the types for this because alttext should be a string but is typed as a boolean. See fix at https://github.com/DefinitelyTyped/DefinitelyTyped/pull/57999. When fixed run command `npm install @types/bwip-js --save-dev` and remove these comments.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import bwipjs from 'bwip-js'
import { createCanvas, Image, registerFont } from 'canvas'
import moment from 'moment'
import type { Recipient } from 'prisonTypes'
import type { CreateBarcodeRequest, CreateBarcodeResponse } from 'sendLegalMailApiClient'
import RestClient from '../../data/restClient'
import config from '../../config'
import logger from '../../../logger'

export default class CreateBarcodeService {
  constructor() {
    registerFont('liberation_sans.ttf', { family: `${this.opts.font}` })
    registerFont('liberation_sans_bold.ttf', { family: `${this.opts.font} Bold` })
  }

  private static restClient(slmToken: string): RestClient {
    return new RestClient('Send Legal Mail API Client', config.apis.sendLegalMail, undefined, slmToken)
  }

  private opts = {
    // These constants represent the correct coordinates of the barcode address image components - however they produce a low quality image, hence the scaleFactor
    // Note that if you change canvasWidth/Height or scaleFactor you will also need to adjust the canvas size used in the copy button - see /assets/js/page-enhancements.js function enableCopyBarcodeButton
    scaleFactor: 4,
    canvasWidth: 253,
    canvasHeight: 98,
    barcodeX: 140,
    barcodeY: 20,
    barcodeWidth: 80,
    barcodeHeight: 70,
    headerTextX: 30,
    headerTextY: 30,
    addressX: 30,
    addressY: 40,
    addressWidth: 108,
    fontPoints: 6,
    font: 'Liberation Sans',
  }

  /**
   * Returns a string containing a freshly generated barcode value.
   */
  async generateBarcodeValue(slmToken: string, recipient: Recipient): Promise<string> {
    try {
      const requestBody: CreateBarcodeRequest = {
        prisonerName: recipient.prisonerName,
        prisonId: recipient.prisonAddress.agencyCode,
        prisonNumber: recipient.prisonNumber,
        dob: recipient.prisonerDob ? moment(recipient.prisonerDob).format('YYYY-MM-DD') : undefined,
        contactId: recipient.contactId,
      }
      const response = (await CreateBarcodeService.restClient(slmToken).post({
        path: `/barcode`,
        data: requestBody,
      })) as CreateBarcodeResponse
      return response.barcode
    } catch (error) {
      logger.error('Error calling CreateBarcode REST API', error)
      throw new Error('Error generating new barcode value')
    }
  }

  /**
   * Returns a data url string representing the png image data of the address and barcode image.
   */
  async generateAddressAndBarcodeDataUrlImage(recipient: Recipient): Promise<string> {
    const barcodeImage = await this.generateBarcodeImage(recipient.barcodeValue)
    return this.generateAddressAndBarcodeImage(barcodeImage, recipient)
  }

  /**
   * Returns the array of Recipients with a freshly generated barcode value for each Recipient
   */
  async addBarcodeValuesToRecipients(recipients: Array<Recipient>, token: string): Promise<Array<Recipient>> {
    return Promise.all(
      recipients.map(async recipient => {
        if (!recipient.barcodeValue) {
          const barcodeValue = await this.generateBarcodeValue(token, recipient)
          return { ...recipient, barcodeValue }
        }
        return recipient
      })
    )
  }

  private async generateBarcodeImage(barcode: string): Promise<Buffer> {
    return bwipjs.toBuffer({
      bcid: 'code128',
      text: barcode,
      alttext: `${barcode.substring(0, 4)}-${barcode.substring(4, 8)}-${barcode.substring(8, 12)}`,
      includetext: true,
      textxalign: 'center',
      scale: this.opts.scaleFactor,
    })
  }

  private scale(pix: number) {
    return this.opts.scaleFactor * pix
  }

  private generateAddressAndBarcodeImage(barcodeImageBuffer: Buffer, recipient: Recipient): string {
    const canvas = createCanvas(this.scale(this.opts.canvasWidth), this.scale(this.opts.canvasHeight))
    canvas.width = Math.ceil(this.scale(canvas.width))
    canvas.height = Math.ceil(this.scale(canvas.height))
    const ctx = canvas.getContext('2d')
    ctx.scale(this.opts.scaleFactor, this.opts.scaleFactor)
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = 'black'
    const barcodeImage = new Image()
    barcodeImage.onload = () => {
      ctx.drawImage(
        barcodeImage,
        this.scale(this.opts.barcodeX),
        this.scale(this.opts.barcodeY),
        this.scale(this.opts.barcodeWidth),
        this.scale(this.opts.barcodeHeight)
      )
    }
    barcodeImage.src = `data:image/png;base64,${barcodeImageBuffer.toString('base64')}`
    ctx.font = `bold ${this.scale(this.opts.fontPoints)}pt "${this.opts.font} Bold"`
    ctx.fillText(`Prison Rule 39`, this.scale(this.opts.headerTextX), this.scale(this.opts.headerTextY))
    ctx.font = `${this.scale(this.opts.fontPoints)}pt "${this.opts.font}"`
    this.formatAddressContent(recipient).forEach((text, index) => {
      if (text !== '') {
        ctx.fillText(
          text,
          this.scale(this.opts.addressX),
          this.scale(this.opts.addressY + index * (this.opts.fontPoints + 2)),
          this.scale(this.opts.addressWidth)
        )
      }
    })
    return `data:image/png;base64,${canvas.toBuffer('image/png', { resolution: this.scale(72) }).toString('base64')}`
  }

  formatAddressContent(recipient: Recipient): Array<string> {
    const name = recipient.prisonerName
    const address = { ...recipient.prisonAddress }
    if (name.length <= 30) {
      return Array.of(
        name,
        recipient.prisonNumber ? recipient.prisonNumber : moment(recipient.prisonerDob).format('DD-MM-YYYY'),
        address.premise,
        address.street,
        address.locality,
        address.postalCode
      )
    }
    // Calculate how to split the name into 2 lines
    let name1length = Math.min(30, name.length - 4)
    let lineBreakChar = '-'
    const naturalLineBreak = name.substring(26, 34).indexOf(' ')
    if (naturalLineBreak !== -1) {
      lineBreakChar = ''
      name1length = naturalLineBreak + 26
    }
    // Return address including 2 lines of names but without street
    const name1 = `${name.substring(0, name1length)}${lineBreakChar}`.trim()
    const name2 = name.substring(name1length, name.length).trim()
    return Array.of(name1, name2, recipient.prisonNumber, address.premise, address.locality, address.postalCode)
  }
}
