import { Request, Response } from 'express'
import BarcodeEntryView from './BarcodeEntryView'
import validate from './BarcodeEntryFormValidator'
import ScanBarcodeService from '../../services/scan/ScanBarcodeService'

/**
 * Controller class responsible for scanning and verifying barcodes.
 * In this context, 'scanning' means scanning with a handheld scanner device, and also manually entering the barcode
 * number via a keyboard. The business process and service calls are the same, with the only real difference being
 * the views that are rendered, so therefore this controller has methods for both scanning and manually entering
 * barcodes.
 */
export default class ScanBarcodeController {
  constructor(private readonly scanBarcodeService: ScanBarcodeService) {}

  /* Methods relating to the use of a handheld scanner device */
  /* ******************************************************** */

  async getScanBarcodeView(req: Request, res: Response): Promise<void> {
    const view = new BarcodeEntryView(req.session?.barcodeEntryForm || {}, req.flash('errors'))

    return res.render('pages/scan/scan-barcode', { ...view.renderArgs })
  }

  /* Methods relating to manually entering and verifying a barcode via a keyboard */
  /* **************************************************************************** */

  async getManualBarcodeEntryView(req: Request, res: Response): Promise<void> {
    const view = new BarcodeEntryView(req.session?.barcodeEntryForm || {}, req.flash('errors'))

    return res.render('pages/scan/manual-barcode-entry', { ...view.renderArgs })
  }

  async submitManualBarcode(req: Request, res: Response): Promise<void> {
    req.session.barcodeEntryForm = { ...req.body }
    if (!validate(req.session.barcodeEntryForm, req)) {
      return res.redirect('manually-enter-barcode')
    }

    return this.verifyBarcode(req.session.barcodeEntryForm.barcode, req.user.username, req).then(() =>
      res.redirect('/scan-barcode/result')
    )
  }

  async getReportManualBarcodeEntryProblemView(req: Request, res: Response): Promise<void> {
    return res.render('pages/scan/report-manual-barcode-entry-problem', {})
  }

  /* Methods common to both scanning and manually entering barcodes */
  /* ************************************************************** */

  async getScanBarcodeResultView(req: Request, res: Response): Promise<void> {
    if (!req.session?.barcodeEntryForm) {
      return res.redirect('/scan-barcode')
    }

    const view = new BarcodeEntryView(req.session.barcodeEntryForm || {}, req.flash('errors'))
    return res.render('pages/scan/scan-barcode-result', { ...view.renderArgs })
  }

  private async verifyBarcode(barcode: string, user: string, req: Request): Promise<void> {
    return this.scanBarcodeService
      .verifyBarcode(barcode, user)
      .then(() => {
        req.session.barcodeEntryForm.status = 'CHECKED'
      })
      .catch(errorResponse => {
        switch (errorResponse.errorCode.code) {
          case 'DUPLICATE': {
            // const duplicateErrorCode: DuplicateErrorCode = errorResponse.errorCode
            req.session.barcodeEntryForm.status = 'DUPLICATE'
            break
          }
          default: {
            throw new Error(`Unsupported error code ${errorResponse.errorCode.code}`)
          }
        }
      })
  }
}
