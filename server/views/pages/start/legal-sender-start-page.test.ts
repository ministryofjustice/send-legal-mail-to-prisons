import fs from 'fs'
import nunjucks, { Template } from 'nunjucks'
import cheerio from 'cheerio'
import { registerNunjucks } from '../../../utils/nunjucksSetup'

const snippet = fs.readFileSync('server/views/pages/start/legal-sender-start-page.njk')

describe('Legal Sender Start Page View', () => {
  let compiledTemplate: Template
  let viewContext: Record<string, unknown>

  const njkEnv = registerNunjucks()

  beforeEach(() => {
    compiledTemplate = nunjucks.compile(snippet.toString(), njkEnv)
  })

  it('should render view', () => {
    const $ = cheerio.load(compiledTemplate.render({}))

    expect($('#legal-sender-start').length).toStrictEqual(1)
  })

  it('should show supported prison names', () => {
    viewContext = { prisonNames: ['some-prison', 'another-prison'] }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('[data-qa=prisonNames]').html()).toContain('some-prison')
    expect($('[data-qa=prisonNames]').html()).toContain('another-prison')
  })
})
