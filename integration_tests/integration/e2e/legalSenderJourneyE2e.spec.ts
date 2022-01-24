import Page from '../../pages/page'
import RequestLinkPage from '../../pages/link/requestLink'
import FindRecipientByPrisonNumberPage from '../../pages/barcode/findRecipientByPrisonNumber'
import CreateNewContactByPrisonNumberPage from '../../pages/barcode/createNewContactByPrisonNumber'
import ReviewRecipientsPage from '../../pages/barcode/reviewRecipients'
import PrintCoversheetsPage from '../../pages/barcode/printCoversheets'
import GenerateBarcodeImagePage from '../../pages/barcode/generateBarcodeImage'

context('Legal Sender Journey E2E', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubAuthToken')
    cy.task('stubRequestLink')
    cy.task('stubVerifyLink')
    cy.task('stubCreateBarcode')
  })

  it('should allow Legal Senders to perform all actions as part of their workflow', () => {
    // Request a magic link and click it to sign in and land on the Find Recipient By Prison Number page
    cy.visit('/link/request-link')
    Page.verifyOnPage(RequestLinkPage).submitFormWithValidEmailAddress('valid@email.address.cjsm.net')
    cy.visit('/link/verify-link?secret=a-valid-secret')
    let findRecipientByPrisonNumberPage = Page.verifyOnPage(FindRecipientByPrisonNumberPage)

    // Add a recipient by prison number where the recipient is a new contact
    findRecipientByPrisonNumberPage.submitWithValidPrisonNumber('A1234BC')
    let createNewContactPage = Page.verifyOnPage(CreateNewContactByPrisonNumberPage)
    let reviewRecipientsPage = createNewContactPage.submitWithValidValues('Gage Hewitt', 'ashfield')
    reviewRecipientsPage.hasRecipientNamesExactly('Gage Hewitt')

    // Remove the recipient, leaving no recipients
    reviewRecipientsPage.removeRecipient(1)
    reviewRecipientsPage.hasNoRecipients()

    // Click to add another recipient and add Gage Hewitt again
    findRecipientByPrisonNumberPage = reviewRecipientsPage.addAnotherRecipient()
    findRecipientByPrisonNumberPage.submitWithValidPrisonNumber('A1234BC')
    createNewContactPage = Page.verifyOnPage(CreateNewContactByPrisonNumberPage)
    reviewRecipientsPage = createNewContactPage.submitWithValidValues('Gage Hewitt', 'ashfield')
    reviewRecipientsPage.hasRecipientNamesExactly('Gage Hewitt')

    // Click to add another recipient
    findRecipientByPrisonNumberPage = reviewRecipientsPage.addAnotherRecipient()
    findRecipientByPrisonNumberPage.submitWithValidPrisonNumber('B1234JS')
    createNewContactPage = Page.verifyOnPage(CreateNewContactByPrisonNumberPage)
    reviewRecipientsPage = createNewContactPage.submitWithValidValues('John Smith', 'altcourse')
    reviewRecipientsPage.hasRecipientNamesExactly('Gage Hewitt', 'John Smith')

    // Click to add a third recipient
    findRecipientByPrisonNumberPage = reviewRecipientsPage.addAnotherRecipient()
    findRecipientByPrisonNumberPage.submitWithValidPrisonNumber('C1234JD')
    createNewContactPage = Page.verifyOnPage(CreateNewContactByPrisonNumberPage)
    reviewRecipientsPage = createNewContactPage.submitWithValidValues('John Doe', 'altcourse')
    reviewRecipientsPage.hasRecipientNamesExactly('Gage Hewitt', 'John Smith', 'John Doe')

    // Remove the 2nd recipient
    reviewRecipientsPage.removeRecipient(2)
    reviewRecipientsPage.hasRecipientNamesExactly('Gage Hewitt', 'John Doe')

    // Move forwards to choose how to prepare the barcodes
    let chooseBarcodeOptionPage = reviewRecipientsPage.prepareBarcodes()

    // Use the browser back button to go back to Review Recipients to add one more recipient
    cy.go(-1)
    reviewRecipientsPage = Page.verifyOnPage(ReviewRecipientsPage)
    findRecipientByPrisonNumberPage = reviewRecipientsPage.addAnotherRecipient()
    findRecipientByPrisonNumberPage.submitWithValidPrisonNumber('D1234FB')
    createNewContactPage = Page.verifyOnPage(CreateNewContactByPrisonNumberPage)
    reviewRecipientsPage = createNewContactPage.submitWithValidValues('Fred Bloggs', 'ashfi')
    reviewRecipientsPage.hasRecipientNamesExactly('Gage Hewitt', 'John Doe', 'Fred Bloggs')

    // Move forwards to choose how to prepare the barcodes
    chooseBarcodeOptionPage = reviewRecipientsPage.prepareBarcodes()

    // Choose the image option
    chooseBarcodeOptionPage.continueToImage()
    Page.verifyOnPage(GenerateBarcodeImagePage)

    // Now go back 2 screens to get back to the Review Recipients page
    cy.go(-2)
    reviewRecipientsPage = Page.verifyOnPage(ReviewRecipientsPage)
    reviewRecipientsPage.hasRecipientNamesExactly('Gage Hewitt', 'John Doe', 'Fred Bloggs')

    // Move forwards to choose how to prepare the barcodes
    chooseBarcodeOptionPage = reviewRecipientsPage.prepareBarcodes()

    // Choose the coversheet option and select a C5 envelope
    chooseBarcodeOptionPage.continueToCoversheet().submitHavingSelectedC5EnvelopeSize()
    Page.verifyOnPage(PrintCoversheetsPage)
  })
})
