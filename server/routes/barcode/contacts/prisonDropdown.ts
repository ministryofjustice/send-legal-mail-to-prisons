import type { PrisonAddress } from 'prisonTypes'

export type DropDownOption = {
  value: string
  text: string
  selected?: boolean
}

export default function getPrisonDropdown(
  prisonRegister: Array<PrisonAddress>,
  selectedPrisonId?: string
): Array<DropDownOption> {
  return [
    { value: '', text: '' },
    ...prisonRegister
      .map((prison: PrisonAddress) => {
        return {
          value: prison.agencyCode,
          text: prison.agyDescription,
          selected: prison.agencyCode === selectedPrisonId,
        }
      })
      .sort((a: DropDownOption, b: DropDownOption) => a.text.localeCompare(b.text)),
  ]
}
