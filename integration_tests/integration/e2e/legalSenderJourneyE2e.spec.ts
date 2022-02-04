import Page from '../../pages/page'
import RequestLinkPage from '../../pages/link/requestLink'
import FindRecipientByPrisonNumberPage from '../../pages/barcode/findRecipientByPrisonNumber'
import CreateNewContactByPrisonNumberPage from '../../pages/barcode/createNewContactByPrisonNumber'
import ReviewRecipientsPage from '../../pages/barcode/reviewRecipients'
import GenerateBarcodeImagePage from '../../pages/barcode/generateBarcodeImage'

context.only('Legal Sender Journey E2E', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubAuthToken')
    cy.task('stubRequestLink')
    cy.task('stubVerifyLink')
    cy.task('stubCreateBarcode')

    // Request a magic link and click it to sign in and land on the Find Recipient By Prison Number page
    cy.visit('/link/request-link')
    Page.verifyOnPage(RequestLinkPage).submitFormWithValidEmailAddress('valid@email.address.cjsm.net')
    cy.visit('/link/verify-link?secret=a-valid-secret')
  })

  it('should allow Legal Senders to perform all actions as part of their workflow - images', () => {
    let findRecipientByPrisonNumberPage = Page.verifyOnPage(FindRecipientByPrisonNumberPage)

    // Add a recipient by prison number where the recipient is a new contact
    findRecipientByPrisonNumberPage.submitWithUnknownPrisonNumber('A1234BC')
    let createNewContactPage = Page.verifyOnPage(CreateNewContactByPrisonNumberPage)
    let reviewRecipientsPage = createNewContactPage.submitWithValidValues('Gage Hewitt', 'ashfield')
    reviewRecipientsPage.hasRecipientNamesExactly('Gage Hewitt')

    // Remove the recipient, leaving no recipients
    reviewRecipientsPage.removeRecipient(1)
    reviewRecipientsPage.hasNoRecipients()

    // Add a recipient by prison number where the recipient is a contact
    findRecipientByPrisonNumberPage = reviewRecipientsPage.addAnotherRecipient()
    reviewRecipientsPage = findRecipientByPrisonNumberPage.submitWithKnownPrisonNumber() // H4567IJ
    reviewRecipientsPage.hasRecipientNamesExactly('Gage Hewitt')

    // Add an unknown recipient by name
    let findRecipientByPrisonerNamePage = reviewRecipientsPage.addAnotherRecipient().goToByPrisonerName()
    let createNewContactByPrisonerNamePage = findRecipientByPrisonerNamePage.submitWithUnknownPrisonerName('John Smith')
    reviewRecipientsPage = createNewContactByPrisonerNamePage.submitWithValidValues('1', '1', '1990', 'altcourse')
    reviewRecipientsPage.hasRecipientNamesExactly('Gage Hewitt', 'John Smith')

    // Add a known recipient by name
    findRecipientByPrisonerNamePage = reviewRecipientsPage.addAnotherRecipient().goToByPrisonerName()
    let chooseContactPage = findRecipientByPrisonerNamePage.submitWithKnownPrisonerName() // the only known contact is John Doe
    reviewRecipientsPage = chooseContactPage.submitForFirstContact()
    reviewRecipientsPage.hasRecipientNamesExactly('Gage Hewitt', 'John Smith', 'John Doe')

    // Add a different John Doe by name
    findRecipientByPrisonerNamePage = reviewRecipientsPage.addAnotherRecipient().goToByPrisonerName()
    chooseContactPage = findRecipientByPrisonerNamePage.submitWithKnownPrisonerName() // the only known contact is John Doe
    createNewContactByPrisonerNamePage = chooseContactPage.submitForNewContact()
    reviewRecipientsPage = createNewContactByPrisonerNamePage.submitWithValidValues('12', '12', '1979', 'leeds')
    reviewRecipientsPage.hasRecipientNamesExactly('Gage Hewitt', 'John Smith', 'John Doe', 'John Doe')

    // Remove some recipients
    reviewRecipientsPage.removeRecipient(2)
    reviewRecipientsPage.removeRecipient(3)
    reviewRecipientsPage.hasRecipientNamesExactly('Gage Hewitt', 'John Doe')

    // Move forwards to choose how to prepare the barcodes
    reviewRecipientsPage.prepareBarcodes()

    // Use the browser back button to go back to Review Recipients to add one more recipient
    cy.go(-1)
    reviewRecipientsPage = Page.verifyOnPage(ReviewRecipientsPage)
    findRecipientByPrisonNumberPage = reviewRecipientsPage.addAnotherRecipient()
    findRecipientByPrisonNumberPage.submitWithUnknownPrisonNumber('D1234FB')
    createNewContactPage = Page.verifyOnPage(CreateNewContactByPrisonNumberPage)
    reviewRecipientsPage = createNewContactPage.submitWithValidValues('Fred Bloggs', 'ashfi')
    reviewRecipientsPage.hasRecipientNamesExactly('Gage Hewitt', 'John Doe', 'Fred Bloggs')

    // Move forwards to choose how to prepare the barcodes
    const chooseBarcodeOptionPage = Page.verifyOnPage(ReviewRecipientsPage).prepareBarcodes()

    // Choose the coversheet option but go back
    chooseBarcodeOptionPage.continueToCoversheet()
    cy.go(-1)

    // Choose the image option
    chooseBarcodeOptionPage.continueToImage()
    Page.verifyOnPage(GenerateBarcodeImagePage)
  })
})
