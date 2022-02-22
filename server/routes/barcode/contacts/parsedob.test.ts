import { Request } from 'express'
import parseDob from './parseDob'

const req = {
  body: {},
}
describe('parseDob', () => {
  it('should handle missing values', () => {
    const dob = parseDob(req as unknown as Request, 'prisonerDob')

    expect(dob?.getTime()).toStrictEqual(undefined)
  })

  it('should handle blank values', () => {
    req.body = { 'prisonerDob-day': '', 'prisonerDob-month': '', 'prisonerDob-year': '' }
    const dob = parseDob(req as unknown as Request, 'prisonerDob')

    expect(dob?.getTime()).toStrictEqual(undefined)
  })

  it('should handle missing day', () => {
    req.body = { 'prisonerDob-day': '', 'prisonerDob-month': '10', 'prisonerDob-year': '1990' }
    const dob = parseDob(req as unknown as Request, 'prisonerDob')

    expect(dob.getTime()).toStrictEqual(NaN)
  })

  it('should handle missing month', () => {
    req.body = { 'prisonerDob-day': '10', 'prisonerDob-month': '', 'prisonerDob-year': '1990' }
    const dob = parseDob(req as unknown as Request, 'prisonerDob')

    expect(dob.getTime()).toStrictEqual(NaN)
  })

  it('should handle missing year', () => {
    req.body = { 'prisonerDob-day': '10', 'prisonerDob-month': '10', 'prisonerDob-year': '' }
    const dob = parseDob(req as unknown as Request, 'prisonerDob')

    expect(dob.getTime()).toStrictEqual(NaN)
  })

  it('should handle invalid date', () => {
    req.body = { 'prisonerDob-day': '31', 'prisonerDob-month': '02', 'prisonerDob-year': '1990' }
    const dob = parseDob(req as unknown as Request, 'prisonerDob')

    expect(dob.getTime()).toStrictEqual(NaN)
  })

  it('should handle valid date', () => {
    req.body = { 'prisonerDob-day': '31', 'prisonerDob-month': '01', 'prisonerDob-year': '1990' }
    const dob = parseDob(req as unknown as Request, 'prisonerDob')

    expect(dob).toStrictEqual(new Date(1990, 0, 31))
  })
})
