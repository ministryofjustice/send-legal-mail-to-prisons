import Page from '../../pages/page'
import RequestLinkPage from '../../pages/link/requestLink'
import FindRecipientPage from '../../pages/barcode/findRecipient'

context('Verify Link', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubAuthToken')
    cy.task('stubVerifyLink')
    cy.task('stubGetPrisonRegister')
  })

  it('should redirect to Find Recipient page if using a valid magic link', () => {
    cy.visit('/link/verify-link?secret=a-valid-secret')

    const findRecipientPage = Page.verifyOnPage(FindRecipientPage)
    findRecipientPage.hasNoErrors()
    findRecipientPage.signOut().should('exist')
    findRecipientPage.userName().should('contain', 'mike.halma@digital.justice.gov.uk')
  })

  it('should redirect to Request Link page if visiting without a value for the `secret` querystring param', () => {
    cy.visit('/link/verify-link')

    Page.verifyOnPage(RequestLinkPage).hasNoErrors()
  })

  it('should redirect to Request Link page if visiting with a `secret` that has not been generated by our Request A Link process', () => {
    cy.task('stubVerifyLinkNotFoundFailure')
    cy.visit('/link/verify-link?secret=a-bogus-secret')

    Page.verifyOnPage(RequestLinkPage).hasErrorContaining('Request a new one')
  })

  it('should redirect to Request Link page if visiting with a `secret` that returns a token with an invalid signature', () => {
    cy.task('stubVerifyLinkInvalidSignatureFailure')
    cy.visit('/link/verify-link?secret=a-valid-secret-whose-token-has-an-invalid-signature')

    Page.verifyOnPage(RequestLinkPage).hasErrorContaining('Request a new one')
  })

  it('should redirect to Request Link page if using a magic link for the second time', () => {
    cy.visit('/link/verify-link?secret=a-valid-secret')
    Page.verifyOnPage(FindRecipientPage)
    cy.task('stubVerifyLinkNotFoundFailure')

    cy.visit('/link/verify-link?secret=a-valid-secret')

    Page.verifyOnPage(RequestLinkPage).hasErrorContaining('Request a new one')
  })

  it('should redirect to Request Link page if using an expired magic link', () => {
    cy.task('stubVerifyLinkThatWillExpireIn1SecondFromNow')

    const twoSeconds = 2000
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(twoSeconds)
    cy.visit('/link/verify-link?secret=a-valid-secret')

    Page.verifyOnPage(RequestLinkPage).hasErrorContaining('Request a new one')
  })

  it('should redirect to Request Link page after signing out', () => {
    cy.visit('/link/verify-link?secret=a-valid-secret')

    const findRecipientPage = Page.verifyOnPage(FindRecipientPage)
    findRecipientPage.signOut().should('exist').click()
    Page.verifyOnPage(RequestLinkPage).hasNoErrors()
  })
})
