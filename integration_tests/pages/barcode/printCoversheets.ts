/* eslint-disable import/no-cycle */
import Page from '../page'
import SelectEnvelopeSizePage from './selectEnvelopeSize'

export default class PrintCoversheetsPage extends Page {
  constructor() {
    super('print-coversheets', false)
    /*
     axeTest (2nd constructor arg) must be false because axe relies on the browser tab being the active tab so that it can
     interrogate the DOM. This page however auto-downloads the coversheet PDF as part of page load, so by the time axe runs
     the active tab is not the page under test (even though the tab is still visible and the PDF has been downloaded rather than
     opened in a new tab)
     */
  }

  static goToPage = (): PrintCoversheetsPage => SelectEnvelopeSizePage.goToPage().submitHavingSelectedDlEnvelopeSize()
}
