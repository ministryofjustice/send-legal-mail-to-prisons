import type { CreateNewContactForm } from 'forms'
import CreateContactView from './CreateContactView'

describe('CreateContactView', () => {
  it('should render args with prison register in alphabetical order', () => {
    const createNewContactForm = {} as CreateNewContactForm
    const errors: Record<string, string>[] = []
    const activePrisons = [
      { id: 'KTI', name: 'Kennet (HMP)' },
      { id: 'ASI', name: 'Ashfield (HMP)' },
      { id: 'ACI', name: 'Altcourse (HMP)' },
    ]

    const view = new CreateContactView(createNewContactForm, activePrisons, errors)

    const renderedArgs = view.renderArgs

    expect(renderedArgs.prisonRegister).toStrictEqual([
      { text: '', value: '' },
      { text: 'Altcourse (HMP)', value: 'ACI' },
      { text: 'Ashfield (HMP)', value: 'ASI' },
      { text: 'Kennet (HMP)', value: 'KTI' },
    ])
  })
})
