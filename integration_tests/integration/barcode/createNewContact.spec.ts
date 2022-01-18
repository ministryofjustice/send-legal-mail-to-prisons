import FindRecipientByPrisonNumberPage from '../../pages/barcode/findRecipientByPrisonNumber'
import Page from '../../pages/page'
import ReviewRecipientsPage from '../../pages/barcode/reviewRecipients'

context('Create New Contact Page', () => {
  it('should redirect to find-recipient given user navigates to Create New Contact without going via find-recipients first', () => {
    FindRecipientByPrisonNumberPage.goToPage()
    cy.visit('/barcode/find-recipient/create-new-contact')

    Page.verifyOnPage(FindRecipientByPrisonNumberPage)
  })

  it('should render review-recipients given form submitted with valid data', () => {
    const createNewContactPage = FindRecipientByPrisonNumberPage.goToPage().happyPath()

    createNewContactPage.submitWithValidValues()

    Page.verifyOnPage(ReviewRecipientsPage)
  })
})
