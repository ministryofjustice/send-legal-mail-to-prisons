import type { FindRecipientForm } from 'forms'
import FindRecipientView from './FindRecipientView'

describe('FindRecipientView', () => {
  it('should render args with prison register in alphabetical order', () => {
    const findRecipientForm = {} as FindRecipientForm
    const errors: Record<string, string>[] = []
    const barcode = '123456789012'
    const barcodeImageUrl = 'http://url/image.gif'
    const activePrisons = [
      { id: 'KTI', name: 'Kennet (HMP)' },
      { id: 'ASI', name: 'Ashfield (HMP)' },
      { id: 'ACI', name: 'Altcourse (HMP)' },
    ]

    const view = new FindRecipientView(findRecipientForm, errors, barcode, barcodeImageUrl, activePrisons)

    const renderedArgs = view.renderArgs

    expect(renderedArgs.prisonRegister).toStrictEqual([
      { text: '', value: '' },
      { text: 'Altcourse (HMP)', value: 'ACI' },
      { text: 'Ashfield (HMP)', value: 'ASI' },
      { text: 'Kennet (HMP)', value: 'KTI' },
    ])
  })
})
