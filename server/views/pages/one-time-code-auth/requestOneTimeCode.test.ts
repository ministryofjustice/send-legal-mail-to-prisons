import fs from 'fs'
import nunjucks, { Template } from 'nunjucks'
import cheerio from 'cheerio'
import { registerNunjucks } from '../../../utils/nunjucksSetup'

const snippet = fs.readFileSync('server/views/pages/one-time-code-auth/requestOneTimeCode.njk')

describe('Request one time code view', () => {
  let compiledTemplate: Template
  let viewContext: Record<string, unknown>

  const njkEnv = registerNunjucks()

  beforeEach(() => {
    compiledTemplate = nunjucks.compile(snippet.toString(), njkEnv)
  })

  it('should render view', () => {
    viewContext = { errors: [] }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('#request-one-time-code').length).toStrictEqual(1)
  })

  it('should display session duration', () => {
    viewContext = { lsjSessionDuration: '1 day', errors: [] }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('p[data-qa=session-duration]').text()).toContain('1 day')
  })

  it('should display errors', () => {
    viewContext = { errors: [{ href: '#email', text: 'some-error' }] }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('div.govuk-error-summary').find('a[href="#email"]').text()).toEqual('some-error')
    expect($('#email-error').text()).toContain('some-error')
  })

  it('should display submit button', () => {
    viewContext = { errors: [] }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('button[data-qa=request-code-button]').text()).toContain('Submit')
  })
})
