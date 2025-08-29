import Page from '../pages/page'
import ReviewRecipientsPage from '../pages/barcode/reviewRecipients'
import generateRandomPrisonNumber from './prisonNumberGenerator'
import FindRecipientByPrisonNumberPage from '../pages/barcode/findRecipientByPrisonNumber'

context('Smoke test', () => {
  it('should create a barcode', () => {
    cy.signInAsSmokeTestLegalSender()
    const findRecipientPage = Page.verifyOnPage(FindRecipientByPrisonNumberPage)

    const createContactPage = findRecipientPage //
      .submitWithPrisonNumber(generateRandomPrisonNumber())
    const reviewRecipientsPage = createContactPage
      .enterAValidPrisonerName('lsj-smoketest')
      .typeAheadAValidPrison('stock')
      .submitForm<ReviewRecipientsPage>(ReviewRecipientsPage)
      .hasRecipientNamesExactly('lsj-smoketest')
      .hasPrisonNamesExactly('HMP Stocken')
    reviewRecipientsPage //
      .prepareBarcodes()
      .continueToCoversheet()
      .submitHavingSelectedDlEnvelopeSize()
      .smokeTestBarcode()
      .then(smokeTestBarcode => {
        cy.task('setSmokeTestBarcode', smokeTestBarcode)
      })
  })
})
