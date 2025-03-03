import fs from 'fs'
import nunjucks, { Template } from 'nunjucks'
import * as cheerio from 'cheerio'
import { registerNunjucks } from '../../../utils/nunjucksSetup'

const snippet = fs.readFileSync('server/views/pages/start/legal-sender-start-page.njk')

describe('Legal Sender Start Page View', () => {
  let compiledTemplate: Template

  const njkEnv = registerNunjucks()

  beforeEach(() => {
    compiledTemplate = nunjucks.compile(snippet.toString(), njkEnv)
  })

  it('should render view', () => {
    const $ = cheerio.load(compiledTemplate.render({}))

    expect($('#legal-sender-start').length).toStrictEqual(1)
  })

  it('should display CJSM link', () => {
    const $ = cheerio.load(compiledTemplate.render({}))
    expect($('a[data-qa=cjsm-link]').attr('href')).toEqual('https://cjsm.justice.gov.uk/')
  })

  it('should show updated any prison supported text instead of prison names', () => {
    const $ = cheerio.load(compiledTemplate.render({}))
    expect($('[data-qa="prisons"]').text()).toEqual('Prisons you can send mail to')
    expect($('[data-qa="prisons"] + p').text()).toEqual(
      'You can use this service to send legal or confidential mail to any prison in England and Wales, including the private prison estate.'
    )
  })
})
