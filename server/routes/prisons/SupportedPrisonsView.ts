export default class SupportedPrisonsView {
  constructor(private readonly prisons: string[], private readonly errors?: Array<Record<string, string>>) {}

  get renderArgs(): { prisons: Array<string>; errors: Array<Record<string, string>> } {
    return { prisons: this.prisons, errors: this.errors || [] }
  }
}
