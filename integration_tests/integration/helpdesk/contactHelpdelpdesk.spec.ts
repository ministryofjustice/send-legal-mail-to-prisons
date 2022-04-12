import RequestLinkPage from '../../pages/link/requestLink'
import Page from '../../pages/page'
import ScanBarcodePage from '../../pages/scan/scanBarcode'
import ContactHelpdeskPage from '../../pages/helpdesk/contactHelpdesk'
import ContactHelpdeskConfirmationPage from '../../pages/helpdesk/contactHelpdeskConfirmation'
import AuthorisationErrorPage from '../../pages/authorisationError'
import FindRecipientByPrisonNumberPage from '../../pages/barcode/findRecipientByPrisonNumber'

context('Contact Helpdesk', () => {
  let contactHelpdeskPage: ContactHelpdeskPage
  const journeyTypes = [
    {
      journey: 'Legal Sender',
      setupFunction: () => {
        const findRecipientByPrisonNumberPage = FindRecipientByPrisonNumberPage.goToPage()
        contactHelpdeskPage = findRecipientByPrisonNumberPage.contactHelpdesk(ContactHelpdeskPage)
        contactHelpdeskPage
          .referringPageIs(findRecipientByPrisonNumberPage.pageId)
          .hasHeaderTitle('Send legal mail to prisons')
      },
    },
    {
      journey: 'Mail Room',
      setupFunction: () => {
        cy.task('stubAuthUser')
        cy.task('stubSignInWithRole_SLM_SCAN_BARCODE')
        cy.signIn()
        cy.visit('/scan-barcode')
        const scanBarcodePage = Page.verifyOnPage(ScanBarcodePage)
        contactHelpdeskPage = scanBarcodePage.contactHelpdesk(ContactHelpdeskPage)
        contactHelpdeskPage.referringPageIs(scanBarcodePage.pageId).hasHeaderTitle('Check Rule 39 mail')
      },
    },
  ]

  journeyTypes.forEach(journeyType => {
    context(`${journeyType.journey} Journey Tests`, () => {
      beforeEach(() => {
        cy.task('reset')
        journeyType.setupFunction()
      })

      it('should display page given form submitted successfully', () => {
        cy.task('stubCreateZendeskTicket')
        contactHelpdeskPage.submitFormWithValidValues()

        Page.verifyOnPage(ContactHelpdeskConfirmationPage)
      })

      it('should rerender page with validation errors given no fields submitted', () => {
        contactHelpdeskPage.submitFormWithNoValues()

        contactHelpdeskPage
          .hasErrorContaining('problem you experience')
          .hasErrorContaining('full name')
          .hasErrorContaining('email address')
      })

      it('should rerender page with error given calling Zendesk API fails', () => {
        cy.task('stubCreateZendeskTicketFailure')
        contactHelpdeskPage.submitFormWithValidValues(ContactHelpdeskPage)

        contactHelpdeskPage.hasErrorContaining('problem sending your message')
      })
    })
  })

  it('should display authError page given unauthenticated user', () => {
    cy.task('reset')
    cy.visit('/scan-barcode/contact-helpdesk', { failOnStatusCode: false })

    Page.verifyOnPage(AuthorisationErrorPage)
  })

  it('should display authError page given authenticated user without any of the SLM roles', () => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.signIn()

    cy.visit('/scan-barcode/contact-helpdesk', { failOnStatusCode: false })

    Page.verifyOnPage(AuthorisationErrorPage)
  })
})
