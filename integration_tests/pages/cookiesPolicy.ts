import Page, { PageElement } from './page'

export default class CookiesPolicyPage extends Page {
  constructor() {
    super('cookies-policy')
  }

  acceptCookiePolicy = (): CookiesPolicyPage => {
    this.acceptCookiePolicyRadioIs().click()
    return this.saveCookiePolicy()
  }

  rejectCookiePolicy = (): CookiesPolicyPage => {
    this.rejectCookiePolicyRadioIs().click()
    return this.saveCookiePolicy()
  }

  saveCookiePolicy = (): CookiesPolicyPage => {
    this.saveCookiePolicyButton().click()
    return this
  }

  acceptCookiePolicyRadioIs = (checked = false): PageElement =>
    cy.get(`input[data-qa="accept"]${checked ? ':checked' : ''}`)

  rejectCookiePolicyRadioIs = (checked = false): PageElement =>
    cy.get(`input[data-qa="reject"]${checked ? ':checked' : ''}`)

  saveCookiePolicyButton = (): PageElement => cy.get('button[data-qa="save-cookies"]')

  successBanner = (): PageElement => cy.get('[data-qa="success-banner"]')

  successBannerLink = (): PageElement => this.successBanner().find('a')

  hasErrorContaining = (partialMessage: string): void => {
    cy.get('.govuk-error-summary__list').should('contain', partialMessage)
    cy.get('#cookies').should('contain', partialMessage)
  }
}
