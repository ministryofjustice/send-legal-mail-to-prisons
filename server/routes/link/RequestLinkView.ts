import type { RequestLinkForm } from 'forms'

export default class RequestLinkView {
  constructor(
    private readonly requestLinkForm: RequestLinkForm,
    private readonly errors?: Array<Record<string, string>>
  ) {}

  get renderArgs(): { form: RequestLinkForm; errors: Array<Record<string, string>> } {
    return {
      form: this.requestLinkForm,
      errors: this.errors || [],
    }
  }
}
