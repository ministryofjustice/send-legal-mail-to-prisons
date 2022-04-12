import Page from '../../pages/page'
import RequestLinkPage from '../../pages/link/requestLink'
import FindRecipientByPrisonNumberPage from '../../pages/barcode/findRecipientByPrisonNumber'
import CreateNewContactByPrisonNumberPage from '../../pages/barcode/createNewContactByPrisonNumber'
import ReviewRecipientsPage from '../../pages/barcode/reviewRecipients'
import featureFlags from '../../support/featureFlags'
import RequestOneTimeCodePage from '../../pages/one-time-code/requestOneTimeCode'

context('Find Recipient By Prison Number Page', () => {
  beforeEach(() => {
    cy.task('reset')
  })

  it('should redirect to sign in page (Request Link or Request Code) if visiting without an auth token in the session', () => {
    cy.visit('/barcode/find-recipient')

    if (featureFlags.isLsjOneTimeCodeAuthEnabled()) {
      Page.verifyOnPage(RequestOneTimeCodePage)
    } else {
      Page.verifyOnPage(RequestLinkPage)
    }
  })

  it('should redisplay form with errors given invalid prison number', () => {
    const findRecipientByPrisonNumberPage = FindRecipientByPrisonNumberPage.goToPage()

    findRecipientByPrisonNumberPage.submitWithInvalidPrisonNumber()

    findRecipientByPrisonNumberPage.hasErrorContaining('correct format')
  })

  it('should render create-contact form given prison number not a contact', () => {
    const findRecipientByPrisonNumberPage = FindRecipientByPrisonNumberPage.goToPage()

    findRecipientByPrisonNumberPage.submitWithUnknownPrisonNumber()

    Page.verifyOnPage(CreateNewContactByPrisonNumberPage)
  })

  it('should render review recipients page given prison number is a contact', () => {
    const findRecipientByPrisonNumberPage = FindRecipientByPrisonNumberPage.goToPage()

    findRecipientByPrisonNumberPage.submitWithKnownPrisonNumber()

    Page.verifyOnPage(ReviewRecipientsPage)
  })
})
