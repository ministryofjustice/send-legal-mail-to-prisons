export type PageElement = Cypress.Chainable<JQuery>

export default abstract class Page {
  static verifyOnPage<T>(constructor: new () => T): T {
    return new constructor()
  }

  protected constructor(
    private readonly pageId: string,
    private readonly options: { axeTest?: boolean; expectHelpdeskLink?: boolean } = {
      axeTest: true,
      expectHelpdeskLink: true,
    }
  ) {
    this.checkOnPage()
    if (options.expectHelpdeskLink) {
      this.checkContactHelpdeskLink()
    }
    if (options.axeTest) {
      this.runAxe()
    }
  }

  checkOnPage = (): void => {
    cy.get(`#${this.pageId}`).should('exist')
  }

  runAxe = (): void => {
    cy.injectAxe()
    cy.checkA11y()
  }

  checkContactHelpdeskLink = (): void => {
    this.contactHelpdeskLink().should('exist').and('be.visible')
  }

  contactHelpdesk = (): void => {
    this.contactHelpdeskLink().click()
    // TODO SLM-106 return next page once developed
  }

  signOut = (): PageElement => cy.get('[data-qa=signOut]')

  manageDetails = (): PageElement => cy.get('[data-qa=manageDetails]')

  userName = (): PageElement => cy.get('[data-qa=header-user-name]')

  contactHelpdeskLink = (): PageElement => cy.get('[data-qa=contact-helpdesk]')

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
