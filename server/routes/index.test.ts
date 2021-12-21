import type { Express } from 'express'
import request from 'supertest'
import { JSDOM } from 'jsdom'
import appWithAllRoutes from './testutils/appSetup'

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({})
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /', () => {
  it(`should render index page with 'Check Rule 39 mail' tile`, () => {
    return request(app)
      .get('/')
      .expect('Content-Type', /html/)
      .expect(res => {
        const doc = new JSDOM(res.text).window.document
        const link = doc.querySelector('a[href="/scan-barcode"]')
        expect(link.textContent).toContain('Check Rule 39 mail')
      })
  })
})
