import type { RequestLinkForm } from 'forms'
import config from '../../config'

export default class RequestLinkView {
  constructor(
    private readonly requestLinkForm: RequestLinkForm,
    private readonly errors?: Array<Record<string, string>>
  ) {}

  get renderArgs(): {
    magicLinkValidityDuration: number
    form: RequestLinkForm
    errors: Array<Record<string, string>>
  } {
    return {
      magicLinkValidityDuration: config.magicLinkValidityDuration,
      form: this.requestLinkForm,
      errors: this.errors || [],
    }
  }
}
