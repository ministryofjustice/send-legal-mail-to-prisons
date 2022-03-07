export type PageElement = Cypress.Chainable<JQuery>

export default abstract class Page {
  static verifyOnPage<T>(constructor: new () => T): T {
    return new constructor()
  }

  protected constructor(
    readonly pageId: string,
    private readonly options: { axeTest?: boolean; expectHelpdeskLink?: boolean } = {
      axeTest: true,
      expectHelpdeskLink: true,
    }
  ) {
    this.checkOnPage()
    this.checkCsfrTokenForFormBasedPages()
    if (options.expectHelpdeskLink) {
      this.checkContactHelpdeskLink()
    }
    if (options.axeTest) {
      this.runAxe()
    }
  }

  checkOnPage = (): void => {
    cy.get('#pageId').should('have.attr', 'data-qa').should('equal', this.pageId)
  }

  checkCsfrTokenForFormBasedPages = (): void => {
    cy.get('body').then(body => {
      body.find('form').each((idx, form) => {
        cy.wrap(form).find('input[name=_csrf]').should('not.have.value', '')
      })
    })
  }

  runAxe = (): void => {
    cy.injectAxe()
    cy.checkA11y()
  }

  checkContactHelpdeskLink = (): void => {
    this.contactHelpdeskLink().should('exist').and('be.visible')
  }

  contactHelpdesk<T>(T): T {
    this.contactHelpdeskLink().invoke('removeAttr', 'target').click()
    return Page.verifyOnPage(T)
  }

  signOut = (): PageElement => cy.get('[data-qa=signOut]')

  manageDetails = (): PageElement => cy.get('[data-qa=manageDetails]')

  userName = (): PageElement => cy.get('[data-qa=header-user-name]')

  contactHelpdeskLink = (): PageElement => cy.get('[data-qa=contact-helpdesk]')

  cookieAction = (type: string): PageElement | undefined => {
    const linkType = type === 'view' ? 'a' : 'button'
    return cy.get('div.govuk-cookie-banner').find(`${linkType}[data-qa="${type}"]`)
  }

  hasCookieBannerContaining = (expectedWord: string) => {
    cy.get('div.govuk-cookie-banner').should('contain.text', expectedWord)
    return this
  }

  doesntHaveCookieBanner = () => {
    cy.get('div.govuk-cookie-banner').should('not.exist')
    return this
  }

  hasCookieAction = (type: string) => {
    this.cookieAction(type).should('exist')
    return this
  }

  doesntHaveCookieAction = (type: string) => {
    this.cookieAction(type).should('not.exist')
    return this
  }

  clickCookieAction<T>(T, type: string): T {
    this.cookieAction(type).click()
    return Page.verifyOnPage(T)
  }

  hasNoErrors = (): void => {
    cy.get('.govuk-error-summary__list').should('not.exist')
  }

  hasMainHeading = (expectedHeading: string): void => {
    cy.get('h1').should('contain.text', expectedHeading)
  }

  hasHeaderTitle = (expectedTitle: string): void => {
    cy.get('a[data-qa="header-text').should('contain.text', expectedTitle)
  }
}
