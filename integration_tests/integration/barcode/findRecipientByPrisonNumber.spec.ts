import Page from '../../pages/page'
import RequestLinkPage from '../../pages/link/requestLink'
import FindRecipientByPrisonNumberPage from '../../pages/barcode/findRecipientByPrisonNumber'
import CreateNewContactPage from '../../pages/barcode/createNewContact'

context('Find Recipient By Prison Number Page', () => {
  it('should redirect to Request List page if visiting without an auth token in the session', () => {
    cy.visit('/barcode/find-recipient')

    Page.verifyOnPage(RequestLinkPage)
  })

  it('should redisplay form with errors given invalid prison number', () => {
    const findRecipientByPrisonNumberPage = FindRecipientByPrisonNumberPage.goToPage()

    findRecipientByPrisonNumberPage.submitWithInvalidPrisonNumber()

    findRecipientByPrisonNumberPage.hasErrorContaining('correct format')
  })

  it('should render create-contact form given valid prison number', () => {
    const findRecipientByPrisonNumberPage = FindRecipientByPrisonNumberPage.goToPage()

    findRecipientByPrisonNumberPage.submitWithValidPrisonNumber()

    Page.verifyOnPage(CreateNewContactPage)
  })
})
