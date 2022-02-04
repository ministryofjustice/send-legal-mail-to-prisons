import Page from '../../pages/page'
import RequestLinkPage from '../../pages/link/requestLink'
import FindRecipientByPrisonerNamePage from '../../pages/barcode/findRecipientByPrisonerName'
import CreateNewContactByPrisonerNamePage from '../../pages/barcode/createNewContactByPrisonerName'
import ChooseContactPage from '../../pages/barcode/chooseContact'

context('Find Recipient By Prisoner Name Page', () => {
  beforeEach(() => {
    cy.task('reset')
  })

  it('should redirect to Request List page if visiting without an auth token in the session', () => {
    cy.visit('/barcode/find-recipient/by-prisoner-name')

    Page.verifyOnPage(RequestLinkPage)
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
