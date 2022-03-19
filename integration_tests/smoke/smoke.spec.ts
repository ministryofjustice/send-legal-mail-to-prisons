import Page from '../pages/page'
import RequestLinkPage from '../pages/link/requestLink'
import ReviewRecipientsPage from '../pages/barcode/reviewRecipients'
import generateRandomPrisonNumber from './prisonNumberGenerator'
import IndexPage from '../pages'

context('Smoke test', () => {
  it('should create a barcode', () => {
    cy.visit(`${Cypress.env('UI_URL')}/link/request-link`)
    const requestLinkPage = Page.verifyOnPage(RequestLinkPage)
    const findRecipientPage = requestLinkPage.submitFormWithSmokeTestUser(Cypress.env('APP_SMOKETEST_LSJSECRET'))

    const createContactPage = findRecipientPage //
      .submitWithPrisonNumber(generateRandomPrisonNumber())
    const reviewRecipientsPage = createContactPage
      .enterAValidPrisonerName('lsj-smoketest')
      .typeAheadAValidPrison('stock')
      .submitForm<ReviewRecipientsPage>(ReviewRecipientsPage)
      .hasRecipientNamesExactly('lsj-smoketest')
      .hasPrisonNamesExactly('HMP Stocken')
    const printCoversheetsPage = reviewRecipientsPage //
      .prepareBarcodes()
      .continueToCoversheet()
      .submitHavingSelectedDlEnvelopeSize()
    printCoversheetsPage.smokeTestBarcode().then(smokeTestBarcode => {
      cy.task('setSmokeTestBarcode', smokeTestBarcode)
    })
  })

  it('should scan the barcode', () => {
    cy.task('getSmokeTestBarcode').then((smokeTestBarcode: string) => {
      cy.visit(`${Cypress.env('UI_URL')}/?smoke-test=${Cypress.env('APP_SMOKETEST_MSJAUTHCODE')}`)
      const scanBarcodePage = Page.verifyOnPage(IndexPage).clickScanBarcodeTile()
      scanBarcodePage.submitFormWithEmptyBarcode().hasErrorContaining('barcode number')

      const resultPage = scanBarcodePage.submitBarcode('124356789012') // TODO this is not putting anything into the barcode field?
      resultPage.hasMainHeading('Barcode not recognised: carry out further checks')

      resultPage.iWantToScanAnotherBarcode().submitBarcode(smokeTestBarcode)
      resultPage.hasMainHeading('Ready for final delivery')

      resultPage.iWantToScanAnotherBarcode().clickToGoToManualBarcodeEntryPage().submitBarcode(smokeTestBarcode)
      resultPage.hasMainHeading('Barcode already scanned: carry out further checks')
    })
  })
})
