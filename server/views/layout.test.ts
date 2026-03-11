import fs from 'fs'
import nunjucks, { Template } from 'nunjucks'
import * as cheerio from 'cheerio'
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
        barcodeUser: {
          cjsmDetails: {
            organisation: 'some-org',
            organisationType: 'some-type',
            townOrCity: 'some-town',
          },
        },
        gtmContainerId: 'some-id',
        cookiesPolicy: { policy: 'accept' },
      }

      const $ = cheerio.load(compiledTemplate.render(viewContext))

      const gaDataLayerScript = $('script[data-qa=gtm-init]')
      expect(gaDataLayerScript.length).toStrictEqual(1)
      expect(gaDataLayerScript.html()).toContain('let user = {};')
      expect(gaDataLayerScript.html()).toContain('window.dataLayer.push({ user: user });')
      expect(gaDataLayerScript.html()).toContain("user.organisation = 'some-org'")
      expect(gaDataLayerScript.html()).toContain("user.business_type = 'some-type'")
      expect(gaDataLayerScript.html()).toContain("user.town_city = 'some-town'")
    })

    it('should include barcodes created count', () => {
      viewContext = {
        barcodeImages: [{ anything: 'anything' }, { anything: 'anything' }],
        gtmContainerId: 'some-id',
        cookiesPolicy: { policy: 'n/a' },
      }

      const $ = cheerio.load(compiledTemplate.render(viewContext))

      const gaDataLayerScript = $('script[data-qa=gtm-init]')
      expect(gaDataLayerScript.length).toStrictEqual(1)
      expect(gaDataLayerScript.html()).toContain("user.barcodes_created_count = '2'")
    })

    it('should not include barcodes created count', () => {
      viewContext = {
        gtmContainerId: 'some-id',
        cookiesPolicy: { policy: 'n/a' },
      }

      const $ = cheerio.load(compiledTemplate.render(viewContext))

      const gaDataLayerScript = $('script[data-qa=gtm-init]')
      expect(gaDataLayerScript.length).toStrictEqual(1)
      expect(gaDataLayerScript.html()).not.toContain('user.barcodes_created_count')
    })
  })
})
