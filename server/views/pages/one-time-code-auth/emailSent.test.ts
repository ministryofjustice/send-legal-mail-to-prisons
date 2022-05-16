import fs from 'fs'
import nunjucks, { Template } from 'nunjucks'
import cheerio from 'cheerio'
import { registerNunjucks } from '../../../utils/nunjucksSetup'

const snippet = fs.readFileSync('server/views/pages/one-time-code-auth/emailSent.njk')

describe('Email sent view', () => {
  let compiledTemplate: Template
  let viewContext: Record<string, unknown>

  const njkEnv = registerNunjucks()

  beforeEach(() => {
    compiledTemplate = nunjucks.compile(snippet.toString(), njkEnv)
  })

  it('should render view', () => {
    viewContext = { errors: [] }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('#one-time-code-email-sent').length).toStrictEqual(1)
  })

  it('should display email sent details', () => {
    viewContext = { emailSentTo: 'some-email', oneTimeCodeValidityDuration: 30, errors: [] }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('p[data-qa=email-sent-to]').text()).toContain('some-email')
    expect($('p[data-qa=code-expiry]').text()).toContain('30 minutes')
  })

  it('should display errors', () => {
    viewContext = { errors: [{ href: '#code', text: 'some-error' }] }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('div.govuk-error-summary').find('a[href="#code"]').text()).toEqual('some-error')
    expect($('#code-error').text()).toContain('some-error')
  })

  it('should display confirm button', () => {
    viewContext = { errors: [] }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('button[data-qa=submit-code-button]').text()).toContain('Confirm')
  })
})
