import { Request } from 'express'
import validateNewContact from './newContactValidator'

describe('newContactValidator', () => {
  const req = {
    flash: jest.fn(),
    body: { prisonerName: undefined as string, prisonId: undefined as string },
  }

  afterEach(() => {
    req.flash.mockReset()
    req.body = { prisonerName: undefined as string, prisonId: undefined as string }
  })

  Array.of(
    { prisonerName: 'Fred Bloggs', prisonId: 'SKI' },
    { prisonerName: 'Fred', prisonId: 'SKI' },
    { prisonerName: 'Mr Fred Bloggs Esquire', prisonId: 'SKI' },
    { prisonerName: 'Jane Ryder Richardson', prisonId: 'SKI' },
    { prisonerName: '   Joanne Ryder-Richardson  ', prisonId: 'SKI' },
    { prisonerName: 'Patrick O`Leary', prisonId: 'SKI' },
    { prisonerName: `Desmond O'Leary  `, prisonId: 'SKI' }
  ).forEach(form => {
    it(`should validate given valid prisoner name and prison id - ${JSON.stringify(form)}`, () => {
      req.body.prisonerName = form.prisonerName
      req.body.prisonId = form.prisonId

      const valid = validateNewContact(req as unknown as Request)

      expect(valid).toBeTruthy()
      expect(req.flash).not.toHaveBeenCalled()
    })
  })

  Array.of(
    { prisonerName: 'Fred Bloggs', prisonId: '' },
    { prisonerName: 'Fred Bloggs', prisonId: null },
    { prisonerName: 'Fred Bloggs', prisonId: undefined }
  ).forEach(form => {
    it(`should not validate given null/empty prison id - ${JSON.stringify(form)}`, () => {
      req.body.prisonerName = form.prisonerName
      req.body.prisonId = form.prisonId

      const valid = validateNewContact(req as unknown as Request)

      expect(valid).toBeFalsy()
      expect(req.flash).toHaveBeenCalledWith('errors', [{ href: '#prisonId', text: 'Select a prison name' }])
    })
  })

  Array.of(
    { prisonerName: '', prisonId: 'SKI' },
    { prisonerName: null, prisonId: 'SKI' },
    { prisonerName: undefined, prisonId: 'SKI' }
  ).forEach(form => {
    it(`should not validate given null/empty prisoner name - ${JSON.stringify(form)}`, () => {
      req.body.prisonerName = form.prisonerName
      req.body.prisonId = form.prisonId

      const valid = validateNewContact(req as unknown as Request)

      expect(valid).toBeFalsy()
      expect(req.flash).toHaveBeenCalledWith('errors', [{ href: '#prisonerName', text: 'Enter a full name' }])
    })
  })

  Array.of(
    { prisonerName: 'Fr3d Bl0ggs', prisonId: 'SKI' },
    { prisonerName: 'Fred!!', prisonId: 'SKI' },
    { prisonerName: 'Mr & Mrs Bloggs', prisonId: 'SKI' },
    { prisonerName: 'Jane Ryder Richardson @ HMP Stoken', prisonId: 'SKI' },
    { prisonerName: 'Joanne Ryder-Richardson (Mrs)', prisonId: 'SKI' }
  ).forEach(form => {
    it(`should not validate given invalid format prisoner name - ${JSON.stringify(form)}`, () => {
      req.body.prisonerName = form.prisonerName
      req.body.prisonId = form.prisonId

      const valid = validateNewContact(req as unknown as Request)

      expect(valid).toBeFalsy()
      expect(req.flash).toHaveBeenCalledWith('errors', [
        { href: '#prisonerName', text: 'Enter names that only use letters, not numbers or symbols.' },
      ])
    })
  })
  it(`should not allow names longer than 60 characters`, () => {
    req.body.prisonerName = '012345678901234567890 2345678901234567890 23456789012345678901'
    req.body.prisonId = 'SKI'

    const valid = validateNewContact(req as unknown as Request)

    expect(valid).toBeFalsy()
    expect(req.flash).toHaveBeenCalledWith('errors', [
      { href: '#prisonerName', text: 'Name can have a maximum length of 60 characters.' },
    ])
  })
})
