import fs from 'fs'
import nunjucks, { Template } from 'nunjucks'
import cheerio from 'cheerio'
import { registerNunjucks } from '../../../utils/nunjucksSetup'

const snippet = fs.readFileSync('server/views/pages/barcode/edit-contact-details.njk')

describe('Edit contact details', () => {
  let compiledTemplate: Template
  let viewContext: Record<string, unknown>

  const njkEnv = registerNunjucks()

  beforeEach(() => {
    compiledTemplate = nunjucks.compile(snippet.toString(), njkEnv)
  })

  describe('id', () => {
    it('should include id in form', () => {
      viewContext = {
        errors: [],
        form: { id: 1 },
      }

      const $ = cheerio.load(compiledTemplate.render(viewContext))

      expect($('#id').val()).toContain('1')
    })
  })

  describe('Name', () => {
    it('should display name', () => {
      viewContext = {
        errors: [],
        form: { name: 'some-name' },
      }

      const $ = cheerio.load(compiledTemplate.render(viewContext))

      expect($('#name').val()).toContain('some-name')
    })

    it('should display name errors', () => {
      viewContext = {
        errors: [{ href: '#name', text: 'some-error' }],
        form: { name: 'some-name' },
      }

      const $ = cheerio.load(compiledTemplate.render(viewContext))

      expect($('div.govuk-error-summary').find('a[href="#name"]').text()).toEqual('some-error')
      expect($('#name-error').text()).toContain('some-error')
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

  describe('Date of birth', () => {
    it('should display dob input', () => {
      viewContext = {
        errors: [],
        form: { 'dob-day': '27', 'dob-month': '03', 'dob-year': '1997' },
      }

      const $ = cheerio.load(compiledTemplate.render(viewContext))

      expect($('#dob-day').val()).toStrictEqual('27')
      expect($('#dob-month').val()).toStrictEqual('03')
      expect($('#dob-year').val()).toStrictEqual('1997')
    })

    it('should set correct widths for dob input', () => {
      viewContext = { errors: [] }

      const $ = cheerio.load(compiledTemplate.render(viewContext))

      expect($('#dob-day').attr('class')).toContain('govuk-input--width-2')
      expect($('#dob-month').attr('class')).toContain('govuk-input--width-2')
      expect($('#dob-year').attr('class')).toContain('govuk-input--width-4')
    })

    it('should highlight dob errors in all inputs', () => {
      viewContext = { errors: [{ href: '#dob', text: 'some-error' }] }

      const $ = cheerio.load(compiledTemplate.render(viewContext))

      expect($('div.govuk-error-summary').find('a[href="#dob"]').text()).toEqual('some-error')
      expect($('#dob-error').text()).toContain('some-error')
      expect($('#dob-day').attr('class')).toContain('govuk-input--error')
    })
  })

  describe('Prison number', () => {
    it('should display prison number', () => {
      viewContext = {
        errors: [],
        form: { prisonNumber: 'some-prison-number' },
      }

      const $ = cheerio.load(compiledTemplate.render(viewContext))

      expect($('#prisonNumber').val()).toContain('some-prison-number')
    })

    it('should display prison number errors', () => {
      viewContext = {
        errors: [{ href: '#prisonNumber', text: 'some-error' }],
        form: { name: 'some-prison-number' },
      }

      const $ = cheerio.load(compiledTemplate.render(viewContext))

      expect($('div.govuk-error-summary').find('a[href="#prisonNumber"]').text()).toEqual('some-error')
      expect($('#prisonNumber-error').text()).toContain('some-error')
    })
  })
})
