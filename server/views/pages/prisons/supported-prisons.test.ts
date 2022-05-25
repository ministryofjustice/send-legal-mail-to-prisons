import fs from 'fs'
import nunjucks, { Template } from 'nunjucks'
import cheerio from 'cheerio'
import { registerNunjucks } from '../../../utils/nunjucksSetup'

const snippet = fs.readFileSync('server/views/pages/prisons/supported-prisons.njk')

describe('Manage supported prisons view', () => {
  let compiledTemplate: Template
  let viewContext: Record<string, unknown>

  const njkEnv = registerNunjucks()

  beforeEach(() => {
    compiledTemplate = nunjucks.compile(snippet.toString(), njkEnv)
  })

  it('should render view', () => {
    viewContext = { errors: [] }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('#manage-supported-prisons').length).toStrictEqual(1)
  })

  it('should show errors', () => {
    viewContext = { errors: [{ text: 'some-error' }] }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('div.govuk-error-summary').text()).toContain('some-error')
  })

  it('should not display prison table if no prisons', () => {
    viewContext = { errors: [] }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('p[data-qa=no-prisons]').length).toStrictEqual(1)
    expect($('#manage-supported-prisons-table').length).toStrictEqual(0)
  })

  it('should display prison table', () => {
    viewContext = { prisons: ['ABC', 'CDE'], errors: [] }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('p[data-qa=no-prisons]').length).toStrictEqual(0)
    expect($('#manage-supported-prisons-table').length).toStrictEqual(1)
    expect($('#manage-supported-prisons-table').find('tr').length).toStrictEqual(3)
  })

  it('should display add prison form', () => {
    viewContext = { errors: [] }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('form[data-qa=add-prison-form]').length).toStrictEqual(1)
    expect($('form[data-qa=add-prison-form]').find('input#addPrison').length).toStrictEqual(1)
    expect($('form[data-qa=add-prison-form]').find('button[data-qa=add-another-prison]').length).toStrictEqual(1)
  })
})
