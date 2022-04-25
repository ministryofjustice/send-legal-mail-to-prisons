import type { Prison } from 'prisonTypes'

export type DropDownOption = {
  value: string
  text: string
  selected?: boolean
}

export default function getPrisonDropdown(
  prisonRegister: Array<Prison>,
  selectedPrisonId?: string
): Array<DropDownOption> {
  return [
    { value: '', text: '' },
    ...prisonRegister
      .map((prison: Prison) => {
        return {
          value: prison.id,
          text: prison.name,
          selected: prison.id === selectedPrisonId,
        }
      })
      .sort((a: DropDownOption, b: DropDownOption) => a.text.localeCompare(b.text)),
  ]
}
