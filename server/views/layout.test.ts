import fs from 'fs'
import nunjucks, { Template } from 'nunjucks'
import cheerio from 'cheerio'
import { registerNunjucks } from '../utils/nunjucksSetup'

const snippet = fs.readFileSync('server/views/layout.njk')

describe('Layout', () => {
  let compiledTemplate: Template
  let viewContext: Record<string, unknown>

  const njkEnv = registerNunjucks()

  beforeEach(() => {
    compiledTemplate = nunjucks.compile(snippet.toString(), njkEnv)
  })

  it('should render view', () => {
    viewContext = { pageId: 'some-page' }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('#some-page').length).toStrictEqual(1)
  })

  describe('Google analytics', () => {
    it('should send legal sender GA data', () => {
      viewContext = {
        externalUser: true,
        barcodeUser: {
          cjsmDetails: {
            organisation: 'some-org',
            organisationType: 'some-type',
            townOrCity: 'some-town',
          },
        },
      }

      const $ = cheerio.load(compiledTemplate.render(viewContext))

      expect($('script[data-qa=mailroom-ga-data]').length).toStrictEqual(0)
      expect($('script[data-qa=legal-sender-ga-data]').length).toStrictEqual(1)
      expect($('script[data-qa=legal-sender-ga-data]').html()).toContain('window.dataLayer.push')
      expect($('script[data-qa=legal-sender-ga-data]').html()).toContain("'organisation': 'some-org'")
      expect($('script[data-qa=legal-sender-ga-data]').html()).toContain("'business_type': 'some-type'")
      expect($('script[data-qa=legal-sender-ga-data]').html()).toContain("'town_city': 'some-town'")
    })

    it('should send mailroom GA data', () => {
      viewContext = {
        externalUser: false,
        user: {
          activeCaseLoadId: 'BXI',
          prisonName: 'Brixton',
        },
      }

      const $ = cheerio.load(compiledTemplate.render(viewContext))

      expect($('script[data-qa=legal-sender-ga-data]').length).toStrictEqual(0)
      expect($('script[data-qa=mailroom-ga-data]').length).toStrictEqual(1)
      expect($('script[data-qa=mailroom-ga-data]').html()).toContain('window.dataLayer.push')
      expect($('script[data-qa=mailroom-ga-data]').html()).toContain("'prison_code': 'BXI'")
      expect($('script[data-qa=mailroom-ga-data]').html()).toContain("'prison_name': 'Brixton'")
    })
  })
})
