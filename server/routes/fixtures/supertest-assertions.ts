import * as superagent from 'superagent'
// eslint-disable-next-line import/no-extraneous-dependencies
import * as cheerio from 'cheerio'
// eslint-disable-next-line import/no-extraneous-dependencies
import { CheerioAPI } from 'cheerio'

export default function assertThat(response: superagent.Response) {
  return new SupertestAssertions(response)
}

class SupertestAssertions {
  private $: CheerioAPI

  constructor(private readonly response: superagent.Response) {
    this.$ = cheerio.load(response.text)
  }

  isOk = (): SupertestAssertions => {
    this.hasStatusCode(200)

    return this
  }

  isNotFound = (): SupertestAssertions => {
    this.hasStatusCode(404)

    return this
  }

  hasPageId = (expected: string): SupertestAssertions => {
    const actual = this.$('#pageId').attr('data-qa')

    expect(actual).toBe(expected)

    return this
  }

  hasNoErrors = (): SupertestAssertions => {
    const actual = this.$('.govuk-error-summary__list').length

    expect(actual).toBe(0)

    return this
  }

  hasError = (expected: string): SupertestAssertions => {
    this.hasAllErrors(expected)

    return this
  }

  hasAllErrors = (...expected: string[]): SupertestAssertions => {
    const actual = this.$('.govuk-error-summary__list').text()

    expected.forEach(expectedMessage => expect(actual).toContain(expectedMessage))

    return this
  }

  hasStatusCode = (expected: number) => {
    const actual = this.response.statusCode

    expect(actual).toBe(expected)
  }
}
