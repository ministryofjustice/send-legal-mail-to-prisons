import Page from '../../pages/page'
import RequestLinkPage from '../../pages/link/requestLink'
import FindRecipientByPrisonNumberPage from '../../pages/barcode/findRecipientByPrisonNumber'
import CreateNewContactPage from '../../pages/barcode/createNewContact'

context('Find Recipient By Prison Number Page', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubAuthToken')
    cy.task('stubRequestLink')
    cy.task('stubGetPrisonRegister')
  })

  it('should redirect to Request List page if visiting without an auth token in the session', () => {
    cy.visit('/barcode/find-recipient')

    Page.verifyOnPage(RequestLinkPage)
  })

  it('should redisplay form with errors given invalid prison number', () => {
    cy.task('stubVerifyLink')
    cy.visit('/link/verify-link?secret=a-valid-secret')
    const findRecipientByPrisonNumberPage = Page.verifyOnPage(FindRecipientByPrisonNumberPage)

    findRecipientByPrisonNumberPage.submitWithInvalidPrisonNumber()

    findRecipientByPrisonNumberPage.hasErrorContaining('correct format')
  })

  it('should render create-contact form given valid prison number', () => {
    cy.task('stubVerifyLink')
    cy.visit('/link/verify-link?secret=a-valid-secret')
    const findRecipientByPrisonNumberPage = Page.verifyOnPage(FindRecipientByPrisonNumberPage)

    findRecipientByPrisonNumberPage.submitWithValidPrisonNumber()

    Page.verifyOnPage(CreateNewContactPage)
  })
})
