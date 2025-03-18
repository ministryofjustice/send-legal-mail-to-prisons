import type { Prison } from 'prisonTypes'
import getPrisonDropdown, { DropDownOption } from '../barcode/contacts/prisonDropdown'

export default class SupportedPrisonsView {
  constructor(
    private readonly supportedPrisons: Array<Prison>,
    private readonly unsupportedPrisons: Array<Prison>,
    private readonly errors?: Array<Record<string, string>>,
  ) {}

  get renderArgs(): {
    supportedPrisons: Array<Prison>
    unsupportedPrisons: Array<DropDownOption>
    errors: Array<Record<string, string>>
  } {
    return {
      supportedPrisons: this.supportedPrisons,
      unsupportedPrisons: getPrisonDropdown(this.unsupportedPrisons),
      errors: this.errors || [],
    }
  }
}
