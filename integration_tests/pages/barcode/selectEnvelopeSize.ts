/* eslint-disable import/no-cycle */
import Page, { PageElement } from '../page'
import PrintCoversheetsPage from './printCoversheets'
import ChooseBarcodeOptionPage from './chooseBarcodeOption'

export default class SelectEnvelopeSizePage extends Page {
  constructor() {
    super('select-envelope-size')
  }

  submitWithoutSelectingEnvelopeSize = (): SelectEnvelopeSizePage => {
    this.submitButton().click()
    return Page.verifyOnPage(SelectEnvelopeSizePage)
  }

  submitHavingSelectedDlEnvelopeSize = (): PrintCoversheetsPage => {
    this.dlRadio().click()
    this.submitButton().click()
    return Page.verifyOnPage(PrintCoversheetsPage)
  }

  submitHavingSelectedC4EnvelopeSize = (): PrintCoversheetsPage => {
    this.c4Radio().click()
    this.submitButton().click()
    return Page.verifyOnPage(PrintCoversheetsPage)
  }

  submitHavingSelectedC5EnvelopeSize = (): PrintCoversheetsPage => {
    this.c5Radio().click()
    this.submitButton().click()
    return Page.verifyOnPage(PrintCoversheetsPage)
  }

  hasErrorContaining = (partialMessage: string): void => {
    cy.get('.govuk-error-summary__list').should('contain', partialMessage)
    cy.get('#envelopeSize-error').should('contain', partialMessage)
  }

  dlRadio = (): PageElement => cy.get('#select-envelope-size-form input[name=envelopeSize][value=dl]')

  c5Radio = (): PageElement => cy.get('#select-envelope-size-form input[name=envelopeSize][value=c5]')

  c4Radio = (): PageElement => cy.get('#select-envelope-size-form input[name=envelopeSize][value=c4]')

  submitButton = (): PageElement => cy.get('#select-envelope-size-form button')

  static goToPage = (): SelectEnvelopeSizePage => ChooseBarcodeOptionPage.goToPage().continueToCoversheet()
}
