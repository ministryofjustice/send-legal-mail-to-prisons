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
    try {
      expect(actual).toBe(expected)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      fail(`Expected pageId value to be ${expected} but was ${actual}`)
    }
    return this
  }

  hasNoErrors = (): SupertestAssertions => {
    const actual = this.$('.govuk-error-summary__list').length
    try {
      expect(actual).toBe(0)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      fail(`Expected page to have 0 error messages but had ${actual}`)
    }
    return this
  }

  hasError = (expected: string): SupertestAssertions => {
    this.hasAllErrors(expected)
    return this
  }

  hasAllErrors = (...expected: string[]): SupertestAssertions => {
    const actual = this.$('.govuk-error-summary__list').text()
    try {
      expected.forEach(expectedMessage => expect(actual).toContain(expectedMessage))
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      fail(`Expected page to have error[s] containing all of [${expected}] but it did not`)
    }
    return this
  }

  hasStatusCode = (expected: number) => {
    const actual = this.response.statusCode
    try {
      expect(actual).toBe(expected)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      fail(`Expected a status code of ${expected} but was ${actual}`)
    }
  }
}
