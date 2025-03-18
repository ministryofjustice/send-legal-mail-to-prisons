import type { RequestLinkForm, RequestOneTimeCodeForm } from 'forms'

export default class RequestOneTimeCodeView {
  constructor(
    private readonly requestOneTimeCodeForm: RequestOneTimeCodeForm,
    private readonly errors?: Array<Record<string, string>>,
  ) {}

  get renderArgs(): {
    form: RequestLinkForm
    errors: Array<Record<string, string>>
  } {
    return {
      form: this.requestOneTimeCodeForm,
      errors: this.errors || [],
    }
  }
}
