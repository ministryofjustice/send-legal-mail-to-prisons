import Page, { PageElement } from '../page'
// eslint-disable-next-line import/no-cycle
import RequestOneTimeCodePage from './requestOneTimeCode'
import FindRecipientByPrisonNumberPage from '../barcode/findRecipientByPrisonNumber'

export default class EmailSentPage extends Page {
  constructor() {
    super('one-time-code-email-sent')
  }

  submitFormWithValidOneTimeCode = (code = 'ABCD'): FindRecipientByPrisonNumberPage => {
    this.oneTimeCodeField().clear().type(code)
    this.submitButton().click()
    return Page.verifyOnPage(FindRecipientByPrisonNumberPage)
  }

  clickRequestSignInCode = (): RequestOneTimeCodePage => {
    cy.get('a[data-qa="request-sign-in-code"]').click()

    return Page.verifyOnPage(RequestOneTimeCodePage)
  }

  oneTimeCodeField = (): PageElement => cy.get('input#code')

  submitButton = (): PageElement => cy.get('[data-qa=submit-code-button')
}
