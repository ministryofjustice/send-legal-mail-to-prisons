import type { CreateNewContactByPrisonNumberForm } from 'forms'
import CreateContactView from './CreateContactView'

describe('CreateContactView', () => {
  it('should render args with prison register in alphabetical order', () => {
    const createNewContactForm = {} as CreateNewContactByPrisonNumberForm
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
      { text: 'Altcourse (HMP)', value: 'ACI', selected: false },
      { text: 'Ashfield (HMP)', value: 'ASI', selected: false },
      { text: 'Kennet (HMP)', value: 'KTI', selected: false },
    ])
  })

  it('should render args with prison register with selected prison id', () => {
    const createNewContactForm = { prisonId: 'ASI' } as CreateNewContactByPrisonNumberForm
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
      { text: 'Altcourse (HMP)', value: 'ACI', selected: false },
      { text: 'Ashfield (HMP)', value: 'ASI', selected: true },
      { text: 'Kennet (HMP)', value: 'KTI', selected: false },
    ])
  })
})
