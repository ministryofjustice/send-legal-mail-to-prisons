export type PageElement = Cypress.Chainable<JQuery>

export default abstract class Page {
  static verifyOnPage<T>(constructor: new () => T): T {
    return new constructor()
  }

  protected constructor(private readonly pageId: string, private readonly axeTest = true) {
    this.checkOnPage()
    if (axeTest) {
      this.runAxe()
    }
  }

  checkOnPage = (): void => {
    cy.get(`#${this.pageId}`).should('exist')
  }

  runAxe = (): void => {
    cy.injectAxe()
    cy.checkA11y(null, {
      includedImpacts: ['critical', 'serious'],
    })
  }

  signOut = (): PageElement => cy.get('[data-qa=signOut]')

  manageDetails = (): PageElement => cy.get('[data-qa=manageDetails]')

  userName = (): PageElement => cy.get('[data-qa=header-user-name]')

  hasNoErrors = (): void => {
    cy.get('.govuk-error-summary__list').should('not.exist')
  }

  hasMainHeading = (expectedHeading: string): void => {
    cy.get('h1').should('contain.text', expectedHeading)
  }
}
