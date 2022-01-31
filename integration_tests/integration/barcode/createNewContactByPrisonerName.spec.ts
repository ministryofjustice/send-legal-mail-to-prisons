import FindRecipientByPrisonNumberPage from '../../pages/barcode/findRecipientByPrisonNumber'
import Page from '../../pages/page'
import ReviewRecipientsPage from '../../pages/barcode/reviewRecipients'
import CreateNewContactByPrisonerNamePage from '../../pages/barcode/createNewContactByPrisonerName'

context('Create New Contact By Prisoner Name Page', () => {
  beforeEach(() => {
    cy.task('reset')
  })

  it('should redirect to find-recipient given user navigates to Create New Contact without going via find-recipients first', () => {
    FindRecipientByPrisonNumberPage.goToPage()
    cy.visit('/barcode/find-recipient/create-new-contact/by-prisoner-name')

    Page.verifyOnPage(FindRecipientByPrisonNumberPage)
  })

  it('should render review-recipients given form submitted with valid data', () => {
    CreateNewContactByPrisonerNamePage.goToPage().submitWithValidValues()

    Page.verifyOnPage(ReviewRecipientsPage)
  })

  it('should show error if prisoner dob not entered', () => {
    CreateNewContactByPrisonerNamePage.goToPage().typeAheadAValidPrison().submitForm(CreateNewContactByPrisonerNamePage)

    Page.verifyOnPage(CreateNewContactByPrisonerNamePage).hasPrisonerDobErrorContaining('Enter a date')
  })

  it('should show error if invalid prisoner dob entered', () => {
    CreateNewContactByPrisonerNamePage.goToPage()
      .typeAheadAValidPrison()
      .enterAValidPrisonerDay('42')
      .enterAValidPrisonerMonth()
      .enterAValidPrisonerYear()
      .submitForm(CreateNewContactByPrisonerNamePage)

    Page.verifyOnPage(CreateNewContactByPrisonerNamePage).hasPrisonerDobErrorContaining('correct format')
  })

  it('should show error if invalid prison entered', () => {
    CreateNewContactByPrisonerNamePage.goToPage()
      .enterAValidPrisonerDay()
      .enterAValidPrisonerMonth()
      .enterAValidPrisonerYear()
      .typeAheadAnInvalidPrison()
      .submitForm(CreateNewContactByPrisonerNamePage)

    Page.verifyOnPage(CreateNewContactByPrisonerNamePage).hasPrisonIdErrorContaining('prison name')
  })
})
