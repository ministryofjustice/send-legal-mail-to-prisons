import fs from 'fs'
import nunjucks, { Template } from 'nunjucks'
import cheerio from 'cheerio'
import { registerNunjucks } from '../../../utils/nunjucksSetup'

const snippet = fs.readFileSync('server/views/pages/barcode/create-new-contact-by-prisoner-name.njk')

describe('Create New Contact By Prisoner Name View', () => {
  let compiledTemplate: Template
  let viewContext: Record<string, unknown>

  const njkEnv = registerNunjucks()

  beforeEach(() => {
    compiledTemplate = nunjucks.compile(snippet.toString(), njkEnv)
  })

  it('should render view', () => {
    viewContext = { errors: [] }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('#create-new-contact-by-prisoner-name').length).toStrictEqual(1)
  })

  describe('prisoner DOB', () => {
    it('should display dob input', () => {
      viewContext = {
        errors: [],
        form: { 'prisonerDob-day': '27', 'prisonerDob-month': '03', 'prisonerDob-year': '1997' },
      }

      const $ = cheerio.load(compiledTemplate.render(viewContext))

      expect($('#prisonerDob-day').val()).toStrictEqual('27')
      expect($('#prisonerDob-month').val()).toStrictEqual('03')
      expect($('#prisonerDob-year').val()).toStrictEqual('1997')
    })

    it('should set correct widths for dob input', () => {
      viewContext = { errors: [] }

      const $ = cheerio.load(compiledTemplate.render(viewContext))

      expect($('#prisonerDob-day').attr('class')).toContain('govuk-input--width-2')
      expect($('#prisonerDob-month').attr('class')).toContain('govuk-input--width-2')
      expect($('#prisonerDob-year').attr('class')).toContain('govuk-input--width-4')
    })

    it('should highlight dob errors in all inputs', () => {
      viewContext = { errors: [{ href: '#prisonerDob-day', text: 'some-error' }] }

      const $ = cheerio.load(compiledTemplate.render(viewContext))

      expect($('div.govuk-error-summary').find('a[href="#prisonerDob-day"]').text()).toEqual('some-error')
      expect($('#prisonerDob-error').text()).toContain('some-error')
      expect($('#prisonerDob-day').attr('class')).toContain('govuk-input--error')
    })
  })

  describe('prison', () => {
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

  describe('prisoner name', () => {
    it('should display prisoner name', () => {
      viewContext = {
        errors: [],
        form: { prisonerName: 'some-prisoner' },
      }

      const $ = cheerio.load(compiledTemplate.render(viewContext))

      expect($('p[data-qa="add-details"]').text()).toContain('some-prisoner')
      expect($('h2[data-qa="locate"]').text()).toContain('some-prisoner')
    })
  })

  describe('Submit', () => {
    it('should display submit button', () => {
      const $ = cheerio.load(compiledTemplate.render(viewContext))

      expect($('button[data-qa="save-button"]').length).toStrictEqual(1)
    })
  })
})
