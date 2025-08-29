import fs from 'fs'
import nunjucks, { Template } from 'nunjucks'
import * as cheerio from 'cheerio'
import { registerNunjucks } from '../../../utils/nunjucksSetup'

const snippet = fs.readFileSync('server/views/pages/helpdesk/contact-helpdesk.njk')

describe('Contact Helpdesk View', () => {
  let compiledTemplate: Template
  let viewContext: Record<string, unknown>

  const njkEnv = registerNunjucks()

  beforeEach(() => {
    compiledTemplate = nunjucks.compile(snippet.toString(), njkEnv)
  })

  it('should render view', () => {
    viewContext = { errors: [] }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('#contact-helpdesk').length).toStrictEqual(1)
  })

  it('should instruct user not to user their CJSM email address', () => {
    viewContext = { errors: [] }

    const $ = cheerio.load(compiledTemplate.render(viewContext))

    expect($('#email-hint').length).toStrictEqual(1)
    expect($('#email-hint').text()).toContain('CJSM email address')
  })
})
