import { Request, Response } from 'express'
import requestOneTimeCodeAuthorised from './requestOneTimeCodeAuthorised'

const req = { session: { barcodeUser: {} } } as Request
const res = { redirect: jest.fn() } as unknown as Response
const next = jest.fn()

const middleware = requestOneTimeCodeAuthorised()

describe('redirect signed in users to the app if they request /oneTimeCode/request-code', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should do nothing if not requesting the request-code page', async () => {
    req.originalUrl = '/something/else'

    await middleware(req, res, next)

    expect(res.redirect).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalledTimes(1)
  })

  it('should redirect if already signed in', async () => {
    req.originalUrl = '/oneTimeCode/request-code'
    req.session.barcodeUser.tokenValid = true

    await middleware(req, res, next)

    expect(res.redirect).toHaveBeenCalledTimes(1)
    expect(next).not.toHaveBeenCalled()
  })

  it('should not redirect if not signed in', async () => {
    req.originalUrl = '/oneTimeCode/request-code'
    req.session.barcodeUser.tokenValid = false

    await middleware(req, res, next)

    expect(res.redirect).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalledTimes(1)
  })

  it('should not redirect if forcing a sign out', async () => {
    req.originalUrl = '/oneTimeCode/request-code?force=true'
    req.session.barcodeUser.tokenValid = true

    await middleware(req, res, next)

    expect(res.redirect).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalledTimes(1)
  })
})
