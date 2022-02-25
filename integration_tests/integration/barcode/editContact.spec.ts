import ReviewRecipientsPage from '../../pages/barcode/reviewRecipients'

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
})
