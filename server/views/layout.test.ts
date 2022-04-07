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
        gtmContainerId: 'some-id',
        cookiesPolicy: { policy: 'accept' },
      }

      const $ = cheerio.load(compiledTemplate.render(viewContext))

      const gaDataLayerScript = $('script[data-qa=gtm-init]')
      expect(gaDataLayerScript.length).toStrictEqual(1)
      expect(gaDataLayerScript.html()).toContain('window.dataLayer.push')
      expect(gaDataLayerScript.html()).toContain("'organisation': 'some-org'")
      expect(gaDataLayerScript.html()).toContain("'business_type': 'some-type'")
      expect(gaDataLayerScript.html()).toContain("'town_city': 'some-town'")
    })

    it('should send mailroom GA data', () => {
      viewContext = {
        externalUser: false,
        user: {
          activeCaseLoadId: 'BXI',
          prisonName: 'Brixton',
        },
        gtmContainerId: 'some-id',
        cookiesPolicy: { policy: 'n/a' },
      }

      const $ = cheerio.load(compiledTemplate.render(viewContext))

      const gaDataLayerScript = $('script[data-qa=gtm-init]')
      expect(gaDataLayerScript.length).toStrictEqual(1)
      expect(gaDataLayerScript.html()).toContain('window.dataLayer.push')
      expect(gaDataLayerScript.html()).toContain("'prison_code': 'BXI'")
      expect(gaDataLayerScript.html()).toContain("'prison_name': 'Brixton'")
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
      expect(gaDataLayerScript.html()).toContain('window.dataLayer.push')
      expect(gaDataLayerScript.html()).toContain("'barcodes_created_count': '2'")
    })

    it('should not include barcodes created count', () => {
      viewContext = {
        gtmContainerId: 'some-id',
        cookiesPolicy: { policy: 'n/a' },
      }

      const $ = cheerio.load(compiledTemplate.render(viewContext))

      const gaDataLayerScript = $('script[data-qa=gtm-init]')
      expect(gaDataLayerScript.length).toStrictEqual(1)
      expect(gaDataLayerScript.html()).toContain('window.dataLayer.push')
      expect(gaDataLayerScript.html()).not.toContain('barcodes_created_count')
    })

    it('should include last barcode scanned', () => {
      viewContext = {
        form: { lastScannedBarcode: 'some-barcode' },
        gtmContainerId: 'some-id',
        cookiesPolicy: { policy: 'n/a' },
      }

      const $ = cheerio.load(compiledTemplate.render(viewContext))

      const gaDataLayerScript = $('script[data-qa=gtm-init]')
      expect(gaDataLayerScript.length).toStrictEqual(1)
      expect(gaDataLayerScript.html()).toContain('window.dataLayer.push')
      expect(gaDataLayerScript.html()).toContain("'scanned_barcode_number': 'some-barcode'")
    })

    it('should not include last barcode scanned', () => {
      viewContext = {
        gtmContainerId: 'some-id',
        cookiesPolicy: { policy: 'n/a' },
      }

      const $ = cheerio.load(compiledTemplate.render(viewContext))

      const gaDataLayerScript = $('script[data-qa=gtm-init]')
      expect(gaDataLayerScript.length).toStrictEqual(1)
      expect(gaDataLayerScript.html()).toContain('window.dataLayer.push')
      expect(gaDataLayerScript.html()).not.toContain('scanned_barcode_number')
    })
  })
})
