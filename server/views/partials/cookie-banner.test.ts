import fs from 'fs'
import nunjucks, { Template } from 'nunjucks'
import cheerio from 'cheerio'
import { registerNunjucks } from '../../utils/nunjucksSetup'

const snippet = fs.readFileSync('server/views/partials/cookie-banner.njk')

describe('Cookie Banner Partial Template', () => {
  let compiledTemplate: Template
  let viewContext: Record<string, unknown>

  const njkEnv = registerNunjucks()

  beforeEach(() => {
    compiledTemplate = nunjucks.compile(snippet.toString(), njkEnv)
  })

  it('should render acceptance buttons if there is currently no policy', () => {
    viewContext = {
      url: '/something',
    }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('.govuk-cookie-banner').find('button[data-qa="accept"]').length).toEqual(1)
    expect($('.govuk-cookie-banner').find('button[data-qa="reject"]').length).toEqual(1)
    expect($('.govuk-cookie-banner').find('a[data-qa="view"]').length).toEqual(1)
  })

  it('should not render on the cookies policy page', () => {
    viewContext = {
      url: '/cookies-policy',
    }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('.govuk-cookie-banner').find('a[data-qa="view"]').length).toEqual(0)
  })

  it('should not render if the cookie policy has been selected', () => {
    viewContext = {
      url: '/something',
      cookiesPolicy: {
        policy: 'some-policy',
      },
    }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('.govuk-cookie-banner').length).toEqual(0)
  })

  it('should render hide button if confirmation required', () => {
    viewContext = {
      url: '/something',
      cookiesPolicy: {
        policy: 'some-policy',
        showConfirmation: true,
      },
    }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('.govuk-cookie-banner').find('button[data-qa="hide"]').length).toEqual(1)
    expect($('.govuk-cookie-banner').find('a[data-qa="view"]').length).toEqual(1)
  })

  it('should not render hide button if confirmation NOT required', () => {
    viewContext = {
      url: '/something',
      cookiesPolicy: {
        policy: 'some-policy',
      },
    }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('.govuk-cookie-banner').find('button[data-qa="hide"]').length).toEqual(0)
    expect($('.govuk-cookie-banner').find('a[data-qa="view"]').length).toEqual(0)
  })

  it('should not render hide button on cookies policy page', () => {
    viewContext = {
      url: '/cookies-policy',
      cookiesPolicy: {
        policy: 'some-policy',
      },
    }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('.govuk-cookie-banner').find('button[data-qa="hide"]').length).toEqual(0)
    expect($('.govuk-cookie-banner').find('a[data-qa="view"]').length).toEqual(0)
  })
})
