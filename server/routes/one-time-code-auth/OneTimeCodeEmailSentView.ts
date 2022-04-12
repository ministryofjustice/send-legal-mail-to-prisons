export default class OneTimeCodeEmailSentView {
  constructor(private readonly emailSentTo: string, private readonly errors?: Array<Record<string, string>>) {}

  get renderArgs(): {
    emailSentTo: string
    errors: Array<Record<string, string>>
  } {
    return {
      emailSentTo: this.emailSentTo,
      errors: this.errors || [],
    }
  }
}
