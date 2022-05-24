export default class SupportedPrisonsView {
  constructor(private readonly errors?: Array<Record<string, string>>) {}

  get renderArgs(): { errors: Array<Record<string, string>> } {
    return { errors: this.errors || [] }
  }
}
