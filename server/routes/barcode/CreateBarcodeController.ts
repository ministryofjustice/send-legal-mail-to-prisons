import { Request, Response } from 'express'
// TODO we cannot import the types for this because alttext should be a string but is typed as a boolean. See fix at https://github.com/DefinitelyTyped/DefinitelyTyped/pull/57999. When fixed run command `npm install @types/bwip-js --save-dev` and remove these comments.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import bwipjs from 'bwip-js'
import CreateBarcodeService from '../../services/barcode/CreateBarcodeService'

export default class CreateBarcodeController {
  constructor(private readonly createBarcodeService: CreateBarcodeService) {}

  async submitCreateBarcode(req: Request, res: Response): Promise<void> {
    return this.createBarcodeService.createBarcode(req.session.createBarcodeAuthToken).then(barcode => {
      bwipjs
        .toBuffer({
          bcid: 'code128',
          text: barcode,
          alttext: `${barcode.substring(0, 4)}-${barcode.substring(4, 8)}-${barcode.substring(8, 12)}`,
          includetext: true,
          textxalign: 'center',
        })
        .then((barcodeBuffer: Buffer) => {
          req.session.barcodeImageUrl = `data:image/png;base64,${barcodeBuffer.toString('base64')}`
          req.session.barcode = barcode
          return res.redirect('/barcode/find-recipient')
        })
    })
  }
}
