import { Request, Response, NextFunction } from 'express'
import createError from 'http-errors'
import handleSlm404Errors from './handleSlm404Errors'

const res = {
  locals: {},
}
const next = jest.fn()
jest.mock('http-errors')

describe('handle SLM 404 errors', () => {
  const middleware = handleSlm404Errors()

  afterEach(() => {
    jest.clearAllMocks()
    res.locals = {}
  })

  it('should do nothing if not an external user', () => {
    middleware({} as unknown as Request, res as unknown as Response, next as unknown as NextFunction)

    expect(next).toHaveBeenCalled()
    expect(createError).not.toHaveBeenCalled()
  })

  it('should create an error for external users', () => {
    res.locals = { externalUser: true }

    middleware({} as unknown as Request, res as unknown as Response, next as unknown as NextFunction)

    expect(createError).toHaveBeenCalledWith(404, 'Not found')
    expect(next).toHaveBeenCalled()
  })
})
