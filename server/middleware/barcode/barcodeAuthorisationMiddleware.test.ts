import { SessionData } from 'express-session'
import { NextFunction, Request, Response } from 'express'
import createError from 'http-errors'
import barcodeAuthorisationMiddleware from './barcodeAuthorisationMiddleware'
import config from '../../config'

jest.mock('http-errors')

describe('barcodeAuthorisationMiddleware', () => {
  const req = {
    session: {
      barcodeUser: {},
    } as unknown as SessionData,
  } as unknown as Request

  const res = {
    redirect: jest.fn(),
  } as unknown as Response

  const next = jest.fn() as NextFunction
  config.featureFlags.lsjOneTimeCodeAuthEnabled = true

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should redirect to login page if no user token', () => {
    barcodeAuthorisationMiddleware()(req, res, next)

    expect(res.redirect).toHaveBeenCalledWith('/oneTimeCode/request-code')
  })

  it('should redirect to login page if session thinks token not valid', () => {
    req.session.barcodeUser = {
      token: 'anything',
      tokenValid: false,
    }

    barcodeAuthorisationMiddleware()(req, res, next)

    expect(res.redirect).toHaveBeenCalledWith('/oneTimeCode/request-code')
  })

  it('should continue with a valid token', () => {
    req.session.barcodeUser = {
      token:
        'eyJhbGciOiJSUzI1NiJ9.eyJqdGkiOiI4YmJlZmMyMS05ZmE4LTQzYmEtYWE5Mi02M2NlNDAwYzFkZDYiLCJzdWIiOiJwYXVsLnNvbGVja2lAZGlnaXRhbC5qdXN0aWNlLmdvdi51ay5janNtLm5ldCIsImV4cCI6MTcyNzIyMjQwMCwiYXV0aG9yaXRpZXMiOlsiUk9MRV9TTE1fQ1JFQVRFX0JBUkNPREUiXSwiY2xpZW50X2lkIjoic2VuZC1sZWdhbC1tYWlsIiwidXNlcl9uYW1lIjoicGF1bC5zb2xlY2tpQGRpZ2l0YWwuanVzdGljZS5nb3YudWsuY2pzbS5uZXQifQ.2OSD0yH8JB42KdR-GVdGXWTRZKiD2i-vIMgZybD8mqcBCqVwYhP4UuLWGjaa2RSr9yvjXP6-DsaFZvvZ05vl482JfougMlzd_3v6uDvebCR0o8QJWw-aidee7q-uNVJQianvtsrsPjiETzW--m90KxsH34u0iBC5MECuT-O37l6XAWtvqXZCHUJ9x-Jay51E4ayPa-n4G8xoHdWQeBxKAPIQiu7UaPFYaogELfYKBhs5pnfGkmiouHtzfJFzUWZXTINX9tFEvE5TtfV5ZdkjS5aS57TX14p4iqGg1xZu0RTu7ImegpwkoxllfdOjrjGTN5L13S-kSczWZdnvuLepnFS6aS_j-Fz_UzSlJlprH4GpOcJCh0wbE6p3_5t9qCfHcgt1apx17rrIThl0R7EPYcUS7eS1mfi1Zp5t-cMsfJlb8eMX3vnnfWkV2pad61uRXA6_8id40yGkXq11K08O-WxH85H4EK1Yk-ihLnd2WSra1nuvhN6dbaPb88b9Gdvz',
      tokenValid: true,
    }

    barcodeAuthorisationMiddleware()(req, res, next)

    expect(res.redirect).not.toHaveBeenCalled()
    expect(createError).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalled()
  })

  it('should continue with an error for an invalid token', () => {
    req.session.barcodeUser = {
      token:
        'eyJhbGciOiJSUzI1NiJ9.eyJqdGkiOiJkZTE3NGM0Yi0xY2M2LTQxYWYtYTczYi01ZTE2YmI5YzE1ZWIiLCJzdWIiOiJhLm4ub3RoZXIudXNlckBkaWdpdGFsLmp1c3RpY2UuZ292LnVrIiwiZXhwIjo0Nzg3NTY5NzIxfQ==.WTqNajHRgZCbNe0g20lK5a7s_5-VeWD-FViu6gTgQaEsavimH_wEz1wZ4sj5osCDkCaLIgjYxGFt_p2IAsr7x0pI5b3CenN4_EMrz2pVVxAXOEEI8Q8QVfTy-iBGyO9W95rFGtmxbdsmYpr7LIr6DxJDUCCrCoeH8f4Dl-4QfKLUn-x_9_Bfum1rtAJ38B5pwiwhlzxeHD58C5XIc7swURGpCA97gtog7kEbyrCDF5AkIM4oYC1ViTMfDypnIJaDAU2ggxkaV5EkiIOB386POjUXkePQDnPajX3C-ugbJlKUPHp9z0CL_ngw5iK3wf9mEy2mWi9VHbUnyqVzfhrbIJK2PKQ0Fb8ZJIZhlB_rD68bgpaKskJwGy3lCMqDV5hiK5rUMsw_6n0asdYIhOvrEkXHrwmR4eRfobkLmtXGGRBswWuMhVXbYxBfZPU4PSkReTnbGRxSub-_UmMIvI_CXXaMdyRv0ixG4R3R7HfgLyZiTffN0p8nKmzKDXWWmPVJ',
      tokenValid: true,
    }

    barcodeAuthorisationMiddleware()(req, res, next)

    expect(res.redirect).not.toHaveBeenCalled()
    expect(createError).toHaveBeenCalledWith(401, 'invalid JWT', { code: 'EBADJWT' })
    expect(next).toHaveBeenCalled()
    expect(req.session.barcodeUser.token).toBeUndefined()
    expect(req.session.barcodeUser.tokenValid).toBeFalsy()
  })
})
