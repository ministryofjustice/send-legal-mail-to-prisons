/* eslint-disable import/no-cycle */
import Page from '../page'
import SelectEnvelopeSizePage from './selectEnvelopeSize'

export default class PrintCoversheetsPage extends Page {
  constructor() {
    super('print-coversheets')
  }

  static goToPage = (): PrintCoversheetsPage => SelectEnvelopeSizePage.goToPage().submitHavingSelectedDlEnvelopeSize()
}
