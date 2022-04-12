import type { RequestLinkForm, RequestOneTimeCodeForm } from 'forms'
import config from '../../config'

export default class RequestOneTimeCodeView {
  constructor(
    private readonly requestOneTimeCodeForm: RequestOneTimeCodeForm,
    private readonly errors?: Array<Record<string, string>>
  ) {}

  get renderArgs(): {
    oneTimeCodeValidityDuration: number
    lsjSessionDuration: string
    form: RequestLinkForm
    errors: Array<Record<string, string>>
  } {
    return {
      oneTimeCodeValidityDuration: config.oneTimeCodeValidityDuration,
      lsjSessionDuration: `${config.lsjSessionDuration} day${config.lsjSessionDuration > 1 ? 's' : ''}`,
      form: this.requestOneTimeCodeForm,
      errors: this.errors || [],
    }
  }
}
