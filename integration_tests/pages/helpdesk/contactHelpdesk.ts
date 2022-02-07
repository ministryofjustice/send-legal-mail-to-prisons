import Page, { PageElement } from '../page'

export default class ContactHelpdeskPage extends Page {
  constructor() {
    super('contact-helpdesk', { expectHelpdeskLink: false })
  }

  referringPageIs = (expectedPageId: string): ContactHelpdeskPage => {
    this.referringPageIdField().should('contain.value', expectedPageId)
    return this
  }

  referringPageIdField = (): PageElement => cy.get('input[name=pageId')
}
