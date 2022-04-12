import Page from '../../pages/page'
import RequestLinkPage from '../../pages/link/requestLink'
import FindRecipientByPrisonerNamePage from '../../pages/barcode/findRecipientByPrisonerName'
import CreateNewContactByPrisonerNamePage from '../../pages/barcode/createNewContactByPrisonerName'
import ChooseContactPage from '../../pages/barcode/chooseContact'
import featureFlags from '../../support/featureFlags'
import RequestOneTimeCodePage from '../../pages/one-time-code/requestOneTimeCode'

context('Find Recipient By Prisoner Name Page', () => {
  beforeEach(() => {
    cy.task('reset')
  })

  it('should redirect to sign in page (Request Link or Request Code) if visiting without an auth token in the session', () => {
    cy.visit('/barcode/find-recipient/by-prisoner-name')

    if (featureFlags.isLsjOneTimeCodeAuthEnabled()) {
      Page.verifyOnPage(RequestOneTimeCodePage)
    } else {
      Page.verifyOnPage(RequestLinkPage)
    }
  })

  it('should redisplay form with errors given invalid prisoner name', () => {
    const findRecipientByPrisonerNamePage = FindRecipientByPrisonerNamePage.goToPage()

    findRecipientByPrisonerNamePage.submitWithInvalidPrisonerName()

    findRecipientByPrisonerNamePage.hasErrorContaining('full name')
  })

  it('should render create-contact form given prisoner name not a contact', () => {
    const findRecipientByPrisonerNamePage = FindRecipientByPrisonerNamePage.goToPage()

    findRecipientByPrisonerNamePage.submitWithUnknownPrisonerName()

    Page.verifyOnPage(CreateNewContactByPrisonerNamePage)
  })

  it('should render choose-contacts form given prisoner name is a saved contact', () => {
    const findRecipientByPrisonerNamePage = FindRecipientByPrisonerNamePage.goToPage()

    findRecipientByPrisonerNamePage.submitWithKnownPrisonerName()

    Page.verifyOnPage(ChooseContactPage)
  })
})
