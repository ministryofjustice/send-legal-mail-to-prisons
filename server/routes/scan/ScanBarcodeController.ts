import { Request, Response } from 'express'
import BarcodeEntryView from './BarcodeEntryView'
import validate from './BarcodeEntryFormValidator'
import ScanBarcodeService from '../../services/scan/ScanBarcodeService'
import { CheckBarcodeResponse } from '../../@types/sendLegalMailApiClientTypes'
import AppInsightsService from '../../services/AppInsightsService'

/**
 * Controller class responsible for scanning and verifying barcodes.
 * In this context, 'scanning' means scanning with a handheld scanner device, and also manually entering the barcode
 * number via a keyboard. The business process and service calls are the same, with the only real difference being
 * the views that are rendered, so therefore this controller has methods for both scanning and manually entering
 * barcodes.
 */
export default class ScanBarcodeController {
  constructor(
    private readonly scanBarcodeService: ScanBarcodeService,
    private readonly appInsightsClient: AppInsightsService
  ) {}

  /* Methods relating to the use of a handheld scanner device */
  /* ******************************************************** */

  async getScanBarcodeView(req: Request, res: Response): Promise<void> {
    const view = new BarcodeEntryView(req.session?.barcodeEntryForm || {}, req.flash('errors'))

    return res.render('pages/scan/scan-barcode', { ...view.renderArgs })
  }

  async submitScannedBarcode(req: Request, res: Response): Promise<void> {
    req.session.barcodeEntryForm = { ...req.body }
    if (!validate(req.session.barcodeEntryForm, req)) {
      return res.redirect('/scan-barcode')
    }

    return this.verifyBarcode(req.session.barcodeEntryForm.barcode, req.user.username, req).then(() =>
      res.redirect('/scan-barcode/result')
    )
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
      return res.redirect('/manually-enter-barcode')
    }

    return this.verifyBarcode(req.session.barcodeEntryForm.barcode, req.user.username, req).then(() =>
      res.redirect('/scan-barcode/result')
    )
  }

  /* Methods common to both scanning and manually entering barcodes */
  /* ************************************************************** */

  async getBarcodeScanProblemView(req: Request, res: Response): Promise<void> {
    this.appInsightsClient.trackEvent('cannotEnterBarcode')

    req.session.barcodeEntryForm = { ...req.body }
    req.session.barcodeEntryForm.errorCode = { code: 'CANNOT_ENTER_BARCODE' }
    return res.redirect('/scan-barcode/result')
  }

  async getScanBarcodeResultView(req: Request, res: Response): Promise<void> {
    if (!req.session?.barcodeEntryForm) {
      return res.redirect('/scan-barcode')
    }

    const view = new BarcodeEntryView(req.session.barcodeEntryForm || {}, req.flash('errors'))
    return res.render('pages/scan/scan-barcode-result', { ...view.renderArgs })
  }

  private async verifyBarcode(barcode: string, user: string, req: Request): Promise<void> {
    req.session.barcodeEntryForm = {}
    return this.scanBarcodeService
      .verifyBarcode(barcode, user)
      .then(apiResponse => {
        const checkBarcodeResponse = apiResponse as CheckBarcodeResponse
        req.session.barcodeEntryForm.createdBy = checkBarcodeResponse.createdBy
      })
      .catch(errorResponse => {
        const errorType = errorResponse.data?.errorCode?.code
        if (errorType === 'DUPLICATE' || errorType === 'RANDOM_CHECK' || errorType === 'EXPIRED') {
          req.session.barcodeEntryForm.errorCode = errorResponse.data.errorCode
        } else if (errorResponse.status === 404) {
          req.session.barcodeEntryForm.errorCode = { code: 'NOT_FOUND' }
        } else {
          throw new Error(`Unsupported error code ${errorType}`)
        }
      })
  }
}
