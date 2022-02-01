import fs from 'fs'
import cheerio from 'cheerio'
import nunjucks, { Template } from 'nunjucks'
import { registerNunjucks } from '../../../utils/nunjucksSetup'

const snippet = fs.readFileSync('server/views/pages/barcode/choose-contact.njk')

describe('Choose Contact View', () => {
  let compiledTemplate: Template
  let viewContext: Record<string, unknown>

  const njkEnv = registerNunjucks()

  const defaultContext: Record<string, unknown> = { errors: [], searchName: '', contacts: [] }

  beforeEach(() => {
    compiledTemplate = nunjucks.compile(snippet.toString(), njkEnv)
  })

  it('should render view', () => {
    viewContext = defaultContext

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('#choose-contact').length).toStrictEqual(1)
  })

  it('should show available radio options', () => {
    viewContext = {
      errors: [],
      searchName: 'John Smith',
      contacts: [
        { id: 1, prisonerName: 'John Smith', prisonId: 'LEI', dob: '1990-01-01' },
        { id: 2, prisonerName: 'John Smith', prisonId: 'BXI', prisonNumber: 'A1234BC' },
      ],
    }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('#contact').val()).toEqual('1')
    expect($('#contact').next('label').text().trim()).toEqual('John Smith 01-01-1990')
    expect($('#contact-2').val()).toEqual('2')
    expect($('#contact-2').next('label').text().trim()).toEqual('John Smith A1234BC')
    expect($('#contact-3').val()).toEqual('-1')
    expect($('#contact-3').next('label').text().trim()).toEqual('I want to send mail to a different "John Smith"')
  })

  it('should show continue button', () => {
    viewContext = defaultContext

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('button[data-qa="continue-button"]').length).toStrictEqual(1)
  })

  it('should show errors', () => {
    viewContext = { errors: [{ href: '#contact', text: 'some-error' }], searchName: '', contacts: [] }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('div.govuk-error-summary').find('a[href="#contact"]').text()).toEqual('some-error')
    expect($('#contact-error').text()).toContain('some-error')
  })
})
