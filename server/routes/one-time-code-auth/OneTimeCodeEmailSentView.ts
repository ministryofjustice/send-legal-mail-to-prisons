import config from '../../config'

export default class OneTimeCodeEmailSentView {
  constructor(private readonly emailSentTo: string, private readonly errors?: Array<Record<string, string>>) {}

  get renderArgs(): {
    oneTimeCodeValidityDuration: number
    emailSentTo: string
    errors: Array<Record<string, string>>
  } {
    return {
      oneTimeCodeValidityDuration: config.oneTimeCodeValidityDuration,
      emailSentTo: this.emailSentTo,
      errors: this.errors || [],
    }
  }
}
