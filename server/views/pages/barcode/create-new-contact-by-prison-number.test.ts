import fs from 'fs'
import nunjucks, { Template } from 'nunjucks'
import * as cheerio from 'cheerio'
import { registerNunjucks } from '../../../utils/nunjucksSetup'

const snippet = fs.readFileSync('server/views/pages/barcode/create-new-contact-by-prison-number.njk')

describe('Create New Contact By Prison Number View', () => {
  let compiledTemplate: Template
  let viewContext: Record<string, unknown>

  const njkEnv = registerNunjucks()

  beforeEach(() => {
    compiledTemplate = nunjucks.compile(snippet.toString(), njkEnv)
  })

  it('should render view', () => {
    viewContext = { errors: [] }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('#create-new-contact-by-prison-number').length).toStrictEqual(1)
  })

  describe('Prison Number', () => {
    it('should display prison number', () => {
      viewContext = { form: { prisonNumber: 'some-prison-number' }, errors: [] }

      const $ = cheerio.load(compiledTemplate.render(viewContext))

      expect($('#create-new-contact-form').find('p:first').text()).toContain('some-prison-number')
    })
  })

  describe('Prisoner name', () => {
    it('should display prisoner name', () => {
      viewContext = { form: { prisonerName: 'some-prisoner-name' }, errors: [] }

      const $ = cheerio.load(compiledTemplate.render(viewContext))

      expect($('#prisonerName').val()).toEqual('some-prisoner-name')
    })

    it('should display errors ', () => {
      viewContext = { errors: [{ href: '#prisonerName', text: 'some-error' }] }

      const $ = cheerio.load(compiledTemplate.render(viewContext))

      expect($('div.govuk-error-summary').find('a[href="#prisonerName"]').text()).toEqual('some-error')
      expect($('#prisonerName-error').text()).toContain('some-error')
    })
  })

  describe('Prison', () => {
    it('should display selected prison', () => {
      viewContext = {
        errors: [],
        prisonRegister: [
          { value: '', text: '' },
          { value: 'SKI', text: 'Stocken', selected: true },
        ],
        form: { prisonId: 'SKI' },
      }

      const $ = cheerio.load(compiledTemplate.render(viewContext))

      expect($('#prisonId option:selected').val()).toStrictEqual('SKI')
    })

    it('should show error on prison', () => {
      viewContext = {
        errors: [{ href: '#prisonId', text: 'some-error' }],
        prisonRegister: [
          { value: '', text: '' },
          { value: 'SKI', text: 'Stocken' },
        ],
      }

      const $ = cheerio.load(compiledTemplate.render(viewContext))

      expect($('div.govuk-error-summary').find('a[href="#prisonId"]').text()).toEqual('some-error')
      expect($('#prisonId-error').text()).toContain('some-error')
    })
  })

  describe('Submit', () => {
    it('should display submit button', () => {
      const $ = cheerio.load(compiledTemplate.render(viewContext))

      expect($('button[data-qa="save-button"]').length).toStrictEqual(1)
    })
  })
})
