import Page from '../../pages/page'
import FindRecipientPage from '../../pages/barcode/findRecipient'

// TODO - temporary test whilst the Create Barcode button is on the Find Recipient page; refactor when appropriate

context('Create Barcode on Find Recipient Page', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubAuthToken')
    cy.task('stubVerifyLink')
    cy.task('stubCreateBarcode')
    cy.task('stubGetPrisonRegister')
  })

  it('should create barcode', () => {
    cy.visit('/link/verify-link?secret=a-valid-secret')
    Page.verifyOnPage(FindRecipientPage)
    cy.get('p').should('contain.text', 'Press the button to generate a barcode')

    cy.get('button').click()
    Page.verifyOnPage(FindRecipientPage)

    cy.get('p').should('contain.text', 'Barcode number: 1234-5678-9012')
  })

  it('should render the correct title in the header', () => {
    cy.visit('/link/verify-link?secret=a-valid-secret')
    Page.verifyOnPage(FindRecipientPage).hasHeaderTitle('Send Legal Mail To Prisons')
  })
})
