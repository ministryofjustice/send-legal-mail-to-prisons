import FindRecipientByPrisonNumberPage from '../../pages/barcode/findRecipientByPrisonNumber'
import Page from '../../pages/page'
import CreateNewContactPage from '../../pages/barcode/createNewContact'
import ReviewRecipientsPage from '../../pages/barcode/reviewRecipients'

context('Create New Contact Page', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubAuthToken')
    cy.task('stubRequestLink')
    cy.task('stubVerifyLink')
    cy.visit('/link/verify-link?secret=a-valid-secret')
    cy.task('stubGetPrisonRegister')
  })

  it('should redirect to find-recipient given user navigates to Create New Contact without going via find-recipients first', () => {
    cy.visit('/barcode/find-recipient/create-new-contact')

    Page.verifyOnPage(FindRecipientByPrisonNumberPage)
  })

  it('should render review-recipients given form submitted with valid data', () => {
    cy.visit('/barcode/find-recipient')
    Page.verifyOnPage(FindRecipientByPrisonNumberPage).submitWithValidPrisonNumber()
    const createNewContactPage = Page.verifyOnPage(CreateNewContactPage)

    createNewContactPage.submitWithValidValues()

    Page.verifyOnPage(ReviewRecipientsPage)
  })
})
