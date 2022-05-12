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
        'eyJhbGciOiJSUzI1NiJ9.eyJqdGkiOiJkZTE3NGM0Yi0xY2M2LTQxYWYtYTczYi01ZTE2YmI5YzE1ZWIiLCJzdWIiOiJtaWtlLmhhbG1hQGRpZ2l0YWwuanVzdGljZS5nb3YudWsiLCJleHAiOjQ3ODc1Njk3MjF9.WTqNajHRgZCbNe0g20lK5a7s_5-VeWD-FViu6gTgQaEsavimH_wEz1wZ4sj5osCDkCaLIgjYxGFt_p2IAsr7x0pI5b3CenN4_EMrz2pVVxAXOEEI8Q8QVfTy-iBGyO9W95rFGtmxbdsmYpr7LIr6DxJDUCCrCoeH8f4Dl-4QfKLUn-x_9_Bfum1rtAJ38B5pwiwhlzxeHD58C5XIc7swURGpCA97gtog7kEbyrCDF5AkIM4oYC1ViTMfDypnIJaDAU2ggxkaV5EkiIOB386POjUXkePQDnPajX3C-ugbJlKUPHp9z0CL_ngw5iK3wf9mEy2mWi9VHbUnyqVzfhrbIJK2PKQ0Fb8ZJIZhlB_rD68bgpaKskJwGy3lCMqDV5hiK5rUMsw_6n0asdYIhOvrEkXHrwmR4eRfobkLmtXGGRBswWuMhVXbYxBfZPU4PSkReTnbGRxSub-_UmMIvI_CXXaMdyRv0ixG4R3R7HfgLyZiTffN0p8nKmzKDXWWmPVJ',
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
