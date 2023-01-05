import FindRecipientByPrisonNumberPage from '../../pages/barcode/findRecipientByPrisonNumber'
import Page from '../../pages/page'
import ReviewRecipientsPage from '../../pages/barcode/reviewRecipients'
import CreateNewContactByPrisonNumberPage from '../../pages/barcode/createNewContactByPrisonNumber'

context('Create New Contact By Prison Number Page', () => {
  beforeEach(() => {
    cy.task('reset')
  })

  it('should redirect to find-recipient given user navigates to Create New Contact without going via find-recipients first', () => {
    FindRecipientByPrisonNumberPage.goToPage()
    cy.visit('/barcode/find-recipient/create-new-contact')

    Page.verifyOnPage(FindRecipientByPrisonNumberPage)
  })

  it('should find a prison when searching with HMP prefix', () => {
    const createNewContactPage = FindRecipientByPrisonNumberPage.goToPage().submitWithUnknownPrisonNumber()

    createNewContactPage.enterAValidPrisonerName().typeAheadHMPValidPrison().submitForm(ReviewRecipientsPage)

    Page.verifyOnPage(ReviewRecipientsPage)
  })

  it('should redisplay create-new-contact given form submitted with prison that was previously correctly selected but an invalid prison typed in', () => {
    const createNewContactPage = FindRecipientByPrisonNumberPage.goToPage().submitWithUnknownPrisonNumber()

    createNewContactPage
      .enterAValidPrisonerName()
      .typeAheadAValidPrison()
      .typeAheadAnInvalidPrison()
      .submitForm(CreateNewContactByPrisonNumberPage)

    Page.verifyOnPage(CreateNewContactByPrisonNumberPage).hasPrisonIdErrorContaining('prison name')
  })

  it('should redisplay create-new-contact given form submitted with prison that was previously correctly selected but then blanked out', () => {
    const createNewContactPage = FindRecipientByPrisonNumberPage.goToPage().submitWithUnknownPrisonNumber()

    createNewContactPage
      .enterAValidPrisonerName()
      .typeAheadAValidPrison()
      .clearPrisonField()
      .submitForm(CreateNewContactByPrisonNumberPage)

    Page.verifyOnPage(CreateNewContactByPrisonNumberPage).hasPrisonIdErrorContaining('prison name')
  })
})
