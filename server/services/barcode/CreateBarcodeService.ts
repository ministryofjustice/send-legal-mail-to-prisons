// TODO we cannot import the types for this because alttext should be a string but is typed as a boolean. See fix at https://github.com/DefinitelyTyped/DefinitelyTyped/pull/57999. When fixed run command `npm install @types/bwip-js --save-dev` and remove these comments.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import bwipjs from 'bwip-js'
import { createCanvas, Image } from 'canvas'
import RestClient from '../../data/restClient'
import config from '../../config'

export default class CreateBarcodeService {
  private static restClient(token: string): RestClient {
    return new RestClient('Send Legal Mail API Client', config.apis.sendLegalMail, token)
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
    fontPoints: 6,
  }

  async createBarcode(token: string): Promise<string> {
    return CreateBarcodeService.restClient(token)
      .postCreateBarcode({ path: `/barcode` })
      .then(response => {
        return response.toString()
      })
  }

  async generateBarcodeImage(barcode: string): Promise<Buffer> {
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

  generateAddressAndBarcodeImage(barcodeImageBuffer: Buffer): string {
    const canvas = createCanvas(this.scale(this.opts.canvasWidth), this.scale(this.opts.canvasHeight))
    canvas.width = Math.ceil(this.scale(canvas.width))
    canvas.height = Math.ceil(this.scale(canvas.height))
    const ctx = canvas.getContext('2d')
    ctx.scale(this.opts.scaleFactor, this.opts.scaleFactor)
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
    ctx.font = `bold ${this.scale(this.opts.fontPoints)}pt Arial`
    ctx.fillText(`Prison Rule 39`, this.scale(this.opts.headerTextX), this.scale(this.opts.headerTextY))
    ctx.font = `${this.scale(this.opts.fontPoints)}pt Arial`
    // TODO SLM-67 When we capture the prisoner name and number we should use it below
    // TODO SLM-75 When we populate the prison address from the prison we should use it below
    ctx.fillText(
      `John Smith
A1234BC
HMP Preston
2 Ribbleton Ln, Preston
PR1 5AB`,
      this.scale(this.opts.addressX),
      this.scale(this.opts.addressY)
    )
    return `data:image/png;base64,${canvas.toBuffer('image/png', { resolution: this.scale(72) }).toString('base64')}`
  }
}
