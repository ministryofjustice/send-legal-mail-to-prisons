import { Request, Response } from 'express'
import requestLinkAuthorised from './requestLinkAuthorised'

const req = { session: {} } as Request
const res = { redirect: jest.fn() } as unknown as Response
const next = jest.fn()

const middleware = requestLinkAuthorised()

describe('redirect signed in users to the app if they request /link/request-link', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should do nothing if not requesting the request-link page', async () => {
    req.originalUrl = '/something/else'

    await middleware(req, res, next)

    expect(res.redirect).not.toBeCalled()
    expect(next).toBeCalledTimes(1)
  })

  it('should redirect if already signed in', async () => {
    req.originalUrl = '/link/request-link'
    req.session.validSlmToken = true

    await middleware(req, res, next)

    expect(res.redirect).toBeCalledTimes(1)
    expect(next).not.toBeCalled()
  })

  it('should not redirect if not signed in', async () => {
    req.originalUrl = '/link/request-link'
    req.session.validSlmToken = false

    await middleware(req, res, next)

    expect(res.redirect).not.toBeCalled()
    expect(next).toBeCalledTimes(1)
  })

  it('should not redirect if forcing a sign out', async () => {
    req.originalUrl = '/link/request-link?force=true'
    req.session.validSlmToken = true

    await middleware(req, res, next)

    expect(res.redirect).not.toBeCalled()
    expect(next).toBeCalledTimes(1)
  })
})
