import getPrisonDropdown from './prisonDropdown'

describe('getPrisonDropdown', () => {
  it('should return dropdown in alphabetical order', () => {
    const activePrisons = [
      { id: 'KTI', name: 'Kennet (HMP)' },
      { id: 'ASI', name: 'Ashfield (HMP)' },
      { id: 'ACI', name: 'Altcourse (HMP)' },
    ]

    const dropdown = getPrisonDropdown(activePrisons)

    expect(dropdown).toStrictEqual([
      { text: '', value: '' },
      { text: 'Altcourse (HMP)', value: 'ACI', selected: false },
      { text: 'Ashfield (HMP)', value: 'ASI', selected: false },
      { text: 'Kennet (HMP)', value: 'KTI', selected: false },
    ])
  })

  it('should dropdown with selected prison id', () => {
    const activePrisons = [
      { id: 'KTI', name: 'Kennet (HMP)' },
      { id: 'ASI', name: 'Ashfield (HMP)' },
      { id: 'ACI', name: 'Altcourse (HMP)' },
    ]

    const dropdown = getPrisonDropdown(activePrisons, 'ASI')

    expect(dropdown).toStrictEqual([
      { text: '', value: '' },
      { text: 'Altcourse (HMP)', value: 'ACI', selected: false },
      { text: 'Ashfield (HMP)', value: 'ASI', selected: true },
      { text: 'Kennet (HMP)', value: 'KTI', selected: false },
    ])
  })
})
