import RequestLinkPage from '../../pages/link/requestLink'
import Page from '../../pages/page'
import ScanBarcodePage from '../../pages/scan/scanBarcode'
import ContactHelpdeskPage from '../../pages/helpdesk/contactHelpdesk'

context('Contact Helpdesk', () => {
  beforeEach(() => {
    cy.task('reset')
  })

  it('should render Contact Helpdesk page from Legal Sender Journey', () => {
    cy.visit('/link/request-link')
    const requestLinkPage = Page.verifyOnPage(RequestLinkPage)

    const contactHelpdeskPage: ContactHelpdeskPage = requestLinkPage.contactHelpdesk(ContactHelpdeskPage)

    contactHelpdeskPage.referringPageIs(requestLinkPage.pageId).hasHeaderTitle('Send legal mail to prisons')
  })

  it('should render Contact Helpdesk page from Mail Room Journey', () => {
    cy.task('stubAuthUser')
    cy.task('stubSignInWithRole_SLM_SCAN_BARCODE')
    cy.signIn()
    cy.visit('/scan-barcode')
    const scanBarcodePage = Page.verifyOnPage(ScanBarcodePage)

    const contactHelpdeskPage: ContactHelpdeskPage = scanBarcodePage.contactHelpdesk(ContactHelpdeskPage)

    contactHelpdeskPage.referringPageIs(scanBarcodePage.pageId).hasHeaderTitle('Check Rule 39 mail')
  })
})
