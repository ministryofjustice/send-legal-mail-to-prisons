import ReviewRecipientsPage from '../../pages/barcode/reviewRecipients'
import Page from '../../pages/page'

context('Edit contact details', () => {
  beforeEach(() => {
    cy.task('reset')
  })

  it('should update contact and recipient', () => {
    let reviewRecipientsPage = ReviewRecipientsPage.goToPage()
    reviewRecipientsPage.hasPrisonNamesExactly('HMP Ashfield')
    const editContactPage = reviewRecipientsPage.editContact(1)
    reviewRecipientsPage = editContactPage
      .hasName('Gage Hewitt')
      .hasPrisonName('Ashfield (HMP)')
      .typeAheadAValidPrison('stocken')
      .submit(1)
    reviewRecipientsPage.hasPrisonNamesExactly('HMP Stocken')
  })

  it('should show errors and then allow update', () => {
    let reviewRecipientsPage = ReviewRecipientsPage.goToPage()
    reviewRecipientsPage.hasPrisonNamesExactly('HMP Ashfield')
    const editContactPage = reviewRecipientsPage.editContact(1)
    editContactPage.typeAheadAValidPrison('q').submitWithError().hasErrorContaining('prisonId', 'prison')
    reviewRecipientsPage = editContactPage.typeAheadAValidPrison('stocken').submit(1)
    reviewRecipientsPage.hasPrisonNamesExactly('HMP Stocken')
  })

  it('should reset form and errors when navigating back to review recipients then choosing to edit contact again', () => {
    // Arrive on the edit contact page with no errors
    let reviewRecipientsPage = ReviewRecipientsPage.goToPage()
    let editContactPage = reviewRecipientsPage.editContact(1)
    editContactPage.hasPrisonName('Ashfield (HMP)').hasNoErrors()

    // make a change that results in a validation error
    editContactPage.typeAheadAValidPrison('q').submitWithError().hasErrorContaining('prisonId', 'prison')

    // click browser back to go back to Review Recipients
    cy.go(-3)
    reviewRecipientsPage = Page.verifyOnPage(ReviewRecipientsPage)

    // edit the contact again
    editContactPage = reviewRecipientsPage.editContact(1)

    // assert the previous validation errors have been cleared and the prison name is from the original contact
    editContactPage.hasPrisonName('Ashfield (HMP)').hasNoErrors()
  })
})
