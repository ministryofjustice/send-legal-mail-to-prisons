import Page from '../../pages/page'
import FindRecipientByPrisonNumberPage from '../../pages/barcode/findRecipientByPrisonNumber'
import CreateNewContactPage from '../../pages/barcode/createNewContact'
import ReviewRecipientsPage from '../../pages/barcode/reviewRecipients'
import ChooseBarcodeOptionPage from '../../pages/barcode/chooseBarcodeOption'
import SelectEnvelopeSizePage from '../../pages/barcode/selectEnvelopeSize'
import PrintCoversheetsPage from '../../pages/barcode/printCoversheets'

context('Select envelope size', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubAuthToken')
    cy.task('stubRequestLink')
    cy.task('stubVerifyLink')
    cy.visit('/link/verify-link?secret=a-valid-secret')
    cy.task('stubGetPrisonRegister')
    cy.visit('/barcode/find-recipient')
    Page.verifyOnPage(FindRecipientByPrisonNumberPage).submitWithValidPrisonNumber()
    Page.verifyOnPage(CreateNewContactPage).submitWithValidValues()
    Page.verifyOnPage(ReviewRecipientsPage).prepareBarcodes()
    Page.verifyOnPage(ChooseBarcodeOptionPage).continueToCoversheet()
  })

  it('should redisplay form with errors given no envelope size selected', () => {
    const selectEnvelopeSizePage = Page.verifyOnPage(SelectEnvelopeSizePage)

    selectEnvelopeSizePage.submitWithoutSelectingEnvelopeSize()

    selectEnvelopeSizePage.hasErrorContaining('Select an option')
    selectEnvelopeSizePage.signOut().click()
  })

  it('should goto print coversheets given envelope size selected', () => {
    const selectEnvelopeSizePage = Page.verifyOnPage(SelectEnvelopeSizePage)

    selectEnvelopeSizePage.submitHavingSelectedC4EnvelopeSize()

    Page.verifyOnPage(PrintCoversheetsPage).signOut().click()
  })
})
