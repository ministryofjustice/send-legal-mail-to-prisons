import type { CjsmUserDetails } from 'sendLegalMailApiClient'
import { Request, Response } from 'express'
import populateBarcodeUser from './populateBarcodeUser'

const mockUserService = {
  getUserDetails: jest.fn(),
}

const req = {
  session: {
    barcodeUser: { email: 'some-user', cjsmDetails: undefined as CjsmUserDetails },
  },
}

const res = {
  locals: { barcodeUser: undefined as CjsmUserDetails },
}

const next = jest.fn()

describe('populateBarcodeUser', () => {
  it('should do nothing if cjsm details saved', async () => {
    req.session = {
      barcodeUser: { email: 'some-user', cjsmDetails: {} },
    }

    await populateBarcodeUser(mockUserService)(req as unknown as Request, res as unknown as Response, next)

    expect(res.locals.barcodeUser.email).toEqual('some-user')
    expect(res.locals.barcodeUser.cjsmDetails).toEqual({})
    expect(next).toHaveBeenCalled()
  })

  it('should set user details if cjsm details found', async () => {
    req.session = {
      barcodeUser: { email: 'some-user', cjsmDetails: undefined },
    }
    const expectedCjsmDetails = {
      userId: 'some-user',
      organisation: 'some-org',
      organisationType: 'some-type',
      townOrCity: 'some-town',
    }
    mockUserService.getUserDetails.mockResolvedValue(expectedCjsmDetails)

    await populateBarcodeUser(mockUserService)(req as unknown as Request, res as unknown as Response, next)

    expect(res.locals.barcodeUser.cjsmDetails).toEqual(expectedCjsmDetails)
    expect(next).toHaveBeenCalled()
  })

  it('should set user id if cjsm details not found', async () => {
    req.session = {
      barcodeUser: { email: 'some-user', cjsmDetails: undefined },
    }
    mockUserService.getUserDetails.mockRejectedValue({ status: 404 })

    await populateBarcodeUser(mockUserService)(req as unknown as Request, res as unknown as Response, next)

    expect(res.locals.barcodeUser.cjsmDetails).toEqual({ userId: 'some-user' })
    expect(next).toHaveBeenCalled()
  })

  it('should do nothing and throw if cjsm details request errors', async () => {
    req.session = {
      barcodeUser: { email: 'some-user', cjsmDetails: undefined },
    }
    mockUserService.getUserDetails.mockRejectedValue('some-error')

    try {
      await populateBarcodeUser(mockUserService)(req as unknown as Request, res as unknown as Response, next)
    } catch (error) {
      expect(error).toEqual('some-error')
    }

    expect(res.locals.barcodeUser.cjsmDetails).toBeUndefined()
  })
})
