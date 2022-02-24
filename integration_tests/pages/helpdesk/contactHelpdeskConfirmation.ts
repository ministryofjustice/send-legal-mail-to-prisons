import Page from '../page'

export default class ContactHelpdeskConfirmationPage extends Page {
  constructor() {
    super('contact-helpdesk-submitted', { expectHelpdeskLink: false })
  }
}
