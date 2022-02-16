import { Request, Response } from 'express'
import type { CheckBarcodeResponse } from 'sendLegalMailApiClient'
import type { BarcodeEntryForm } from 'forms'
import BarcodeEntryView from './BarcodeEntryView'
import validate from './BarcodeEntryFormValidator'
import ScanBarcodeService from '../../services/scan/ScanBarcodeService'
import AppInsightsService from '../../services/AppInsightsService'
import VerifyBarcodeErrorResponseMapper from './VerifyBarcodeErrorResponseMapper'

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
    private readonly verifyBarcodeErrorResponseMapper: VerifyBarcodeErrorResponseMapper,
    private readonly appInsightsClient: AppInsightsService
  ) {}

  /* Methods relating to the use of a handheld scanner device */
  /* ******************************************************** */

  async getScanBarcodeView(req: Request, res: Response): Promise<void> {
    const view = new BarcodeEntryView(req.session?.barcodeEntryForm || {}, req.flash('errors'))

    // Render a subtly different view based on whether the user has scanned their first barcode or not.
    // They are different views, but functionally they are the same.
    const templateToRender =
      req.session.scannedAtLeastOneBarcode !== true ? 'pages/scan/scan-barcode' : 'pages/scan/scan-another-barcode'
    return res.render(templateToRender, { ...view.renderArgs })
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
    this.trackEvent('cannotEnterBarcode', res)

    req.session.barcodeEntryForm = { ...req.body }
    req.session.barcodeEntryForm.errorCode = { code: 'CANNOT_ENTER_BARCODE' }
    return res.redirect('/scan-barcode/result')
  }

  async getFurtherChecksNeededView(req: Request, res: Response): Promise<void> {
    this.trackEvent('furtherChecksNeeded', res)
    const form: BarcodeEntryForm = req.session.barcodeEntryForm
    await this.scanBarcodeService.notifyMoreChecksRequested(form.lastScannedBarcode, req.user.username)

    form.errorCode = { code: 'FURTHER_CHECKS_NEEDED' }
    return res.redirect('/scan-barcode/result')
  }

  async getScanBarcodeResultView(req: Request, res: Response): Promise<void> {
    if (!req.session?.barcodeEntryForm) {
      return res.redirect('/scan-barcode')
    }

    req.session.scannedAtLeastOneBarcode = true
    const view = new BarcodeEntryView(req.session.barcodeEntryForm || {}, req.flash('errors'))
    return res.render('pages/scan/scan-barcode-result', { ...view.renderArgs })
  }

  private async verifyBarcode(barcode: string, user: string, req: Request): Promise<void> {
    req.session.barcodeEntryForm = { lastScannedBarcode: barcode }
    return this.scanBarcodeService
      .verifyBarcode(barcode, user)
      .then(apiResponse => {
        const checkBarcodeResponse = apiResponse as CheckBarcodeResponse
        req.session.barcodeEntryForm.createdBy = checkBarcodeResponse.createdBy
      })
      .catch(errorResponse => {
        req.session.barcodeEntryForm.errorCode = this.verifyBarcodeErrorResponseMapper.mapErrorResponse(errorResponse)
      })
  }

  private trackEvent(eventName: string, res: Response): void {
    const properties = { username: res.locals.user.username, prison: res.locals.user.activeCaseLoadId }
    this.appInsightsClient.trackEvent(eventName, properties)
  }
}
