import Page from '../../pages/page'
import SelectEnvelopeSizePage from '../../pages/barcode/selectEnvelopeSize'

context('Select envelope size', () => {
  let selectEnvelopeSizePage: SelectEnvelopeSizePage

  beforeEach(() => {
    selectEnvelopeSizePage = SelectEnvelopeSizePage.goToPage()
  })

  it('should redisplay form with errors given no envelope size selected', () => {
    selectEnvelopeSizePage.submitWithoutSelectingEnvelopeSize()

    selectEnvelopeSizePage.hasErrorContaining('Select an option')
  })

  it('should goto print coversheets given envelope size selected', () => {
    selectEnvelopeSizePage = Page.verifyOnPage(SelectEnvelopeSizePage)

    selectEnvelopeSizePage.submitHavingSelectedC4EnvelopeSize()
  })
})
