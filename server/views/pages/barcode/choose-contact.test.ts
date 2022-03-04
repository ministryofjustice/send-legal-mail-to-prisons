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

    expect($('#contactId').val()).toEqual('1')
    expect($('#contactId').next('label').text().trim()).toEqual('John Smith 1 January 1990')
    expect($('#contactId-2').val()).toEqual('2')
    expect($('#contactId-2').next('label').text().trim()).toEqual('John Smith A1234BC')
    expect($('#contactId-3').val()).toEqual('-1')
    expect($('#contactId-3').next('label').text().trim()).toEqual('I want to send mail to a different "John Smith"')
  })

  it('should show continue button', () => {
    viewContext = defaultContext

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('button[data-qa="continue-button"]').length).toStrictEqual(1)
  })

  it('should show errors', () => {
    viewContext = { errors: [{ href: '#contactId', text: 'some-error' }], searchName: '', contacts: [] }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('div.govuk-error-summary').find('a[href="#contactId"]').text()).toEqual('some-error')
    expect($('#contactId-error').text()).toContain('some-error')
  })
})
