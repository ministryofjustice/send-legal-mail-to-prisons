import Page, { PageElement } from '../page'
// eslint-disable-next-line import/no-cycle
import RequestLinkPage from './requestLink'

export default class EmailSentPage extends Page {
  constructor() {
    super('Now check your emails')
  }

  clickRequestSignInLink = (): RequestLinkPage => {
    cy.get('a[data-qa="request-sign-in-link"]').click()

    return Page.verifyOnPage(RequestLinkPage)
  }

  successBanner = (): PageElement => cy.get('div.govuk-notification-banner--success')
}
