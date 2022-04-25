import type { CreateNewContactByPrisonNumberForm } from 'forms'
import CreateContactByPrisonNumberView from './CreateContactByPrisonNumberView'

describe('CreateContactByPrisonNumberView', () => {
  it('should render args with prison register in alphabetical order', () => {
    const createNewContactForm = {} as CreateNewContactByPrisonNumberForm
    const errors: Record<string, string>[] = []
    const activePrisons = [
      { agencyCode: 'KTI', agyDescription: 'Kennet (HMP)' },
      { agencyCode: 'ASI', agyDescription: 'Ashfield (HMP)' },
      { agencyCode: 'ACI', agyDescription: 'Altcourse (HMP)' },
    ]

    const view = new CreateContactByPrisonNumberView(createNewContactForm, activePrisons, errors)

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
      { agencyCode: 'KTI', agyDescription: 'Kennet (HMP)' },
      { agencyCode: 'ASI', agyDescription: 'Ashfield (HMP)' },
      { agencyCode: 'ACI', agyDescription: 'Altcourse (HMP)' },
    ]

    const view = new CreateContactByPrisonNumberView(createNewContactForm, activePrisons, errors)

    const renderedArgs = view.renderArgs

    expect(renderedArgs.prisonRegister).toStrictEqual([
      { text: '', value: '' },
      { text: 'Altcourse (HMP)', value: 'ACI', selected: false },
      { text: 'Ashfield (HMP)', value: 'ASI', selected: true },
      { text: 'Kennet (HMP)', value: 'KTI', selected: false },
    ])
  })
})
