import { Request } from 'express'
import { SessionData } from 'express-session'
import type { Contact } from 'sendLegalMailApiClient'
import type { PrisonAddress } from 'prisonTypes'
import type { RecipientForm } from 'forms'
import moment from 'moment'
import RecipientFormService from './RecipientFormService'
import PrisonRegisterService from '../../../services/prison/PrisonRegisterService'

const req = {
  session: {} as SessionData,
}

const prisonRegisterService = {
  getPrisonAddress: jest.fn(),
}

const aContact = (): Contact => {
  return {
    id: 1,
    prisonerName: 'John Smith',
    prisonId: 'LEI',
    prisonNumber: 'A1234BC',
  }
}

const aContactDob = (): Contact => {
  return {
    id: 1,
    prisonerName: 'John Smith',
    prisonId: 'LEI',
    dob: '1990-01-01',
  }
}

const aPrisonAddress = (): PrisonAddress => {
  return {
    premise: 'HMP Leeds',
  }
}

const aRecipientForm = (): RecipientForm => {
  return {
    prisonerName: 'John Smith',
    prisonNumber: 'A1234BC',
    prisonId: 'LEI',
  }
}

const aRecipientDobForm = (): RecipientForm => {
  return {
    prisonerName: 'John Smith',
    prisonerDob: moment('1990-01-01', 'YYYY-MM-DD').toDate(),
    prisonId: 'LEI',
  }
}
describe('Recipient Form Service', () => {
  let recipientFormService: RecipientFormService

  beforeEach(() => {
    recipientFormService = new RecipientFormService(prisonRegisterService as unknown as PrisonRegisterService)
  })

  afterEach(() => {
    prisonRegisterService.getPrisonAddress.mockReset()
    req.session = {} as SessionData
  })

  describe('requiresName', () => {
    it('should return redirect if no form', () => {
      expect(recipientFormService.requiresName(req as unknown as Request)).toBeTruthy()
    })

    it('should return redirect if no prisoner name', () => {
      req.session.recipientForm = {}

      expect(recipientFormService.requiresName(req as unknown as Request)).toBeTruthy()
    })

    it('should return redirect if empty prisoner name', () => {
      req.session.recipientForm = { prisonerName: '' }

      expect(recipientFormService.requiresName(req as unknown as Request)).toBeTruthy()
    })

    it('should not return redirect if prisoner name', () => {
      req.session.recipientForm = { prisonerName: 'John Smith' }

      expect(recipientFormService.requiresName(req as unknown as Request)).toBeUndefined()
    })
  })

  describe('requiresPrisonNumber', () => {
    it('should return redirect if no form', () => {
      expect(recipientFormService.requiresPrisonNumber(req as unknown as Request)).toBeTruthy()
    })

    it('should return redirect if no prison number', () => {
      req.session.recipientForm = {}

      expect(recipientFormService.requiresPrisonNumber(req as unknown as Request)).toBeTruthy()
    })

    it('should return redirect if empty prisoner name', () => {
      req.session.recipientForm = { prisonNumber: '' }

      expect(recipientFormService.requiresPrisonNumber(req as unknown as Request)).toBeTruthy()
    })

    it('should not return redirect if prisoner name', () => {
      req.session.recipientForm = { prisonNumber: 'A1234BC' }

      expect(recipientFormService.requiresPrisonNumber(req as unknown as Request)).toBeUndefined()
    })
  })

  describe('requiresContacts', () => {
    it('should return redirect if no form', () => {
      expect(recipientFormService.requiresContacts(req as unknown as Request)).toBeTruthy()
    })

    it('should return redirect if no contacts', () => {
      req.session.recipientForm = {}

      expect(recipientFormService.requiresContacts(req as unknown as Request)).toBeTruthy()
    })

    it('should return redirect if empty contacts', () => {
      req.session.recipientForm = { contacts: [] }

      expect(recipientFormService.requiresContacts(req as unknown as Request)).toBeTruthy()
    })

    it('should not return redirect if contacts exist', () => {
      req.session.recipientForm = { contacts: [aContact()] }

      expect(recipientFormService.requiresContacts(req as unknown as Request)).toBeUndefined()
    })
  })

  describe('addRecipient', () => {
    it('should add the passed recipient to the saved list', async () => {
      prisonRegisterService.getPrisonAddress.mockReturnValue(aPrisonAddress())
      const recipient = aRecipientForm()

      await recipientFormService.addRecipient(req as unknown as Request, recipient)

      expect(req.session.recipients[0]).toEqual({
        prisonNumber: 'A1234BC',
        prisonerName: 'John Smith',
        prisonAddress: aPrisonAddress(),
      })
      expect(req.session.recipientForm).toStrictEqual({})
      expect(prisonRegisterService.getPrisonAddress).toHaveBeenCalledWith('LEI')
    })

    it('should add a recipient from the session to the saved list', async () => {
      prisonRegisterService.getPrisonAddress.mockReturnValue(aPrisonAddress())
      req.session.recipientForm = aRecipientForm()

      await recipientFormService.addRecipient(req as unknown as Request)

      expect(req.session.recipients[0]).toEqual({
        prisonNumber: 'A1234BC',
        prisonerName: 'John Smith',
        prisonAddress: aPrisonAddress(),
      })
    })

    it('should add a recipient with DOB to the saved list', async () => {
      prisonRegisterService.getPrisonAddress.mockReturnValue(aPrisonAddress())
      req.session.recipientForm = aRecipientDobForm()

      await recipientFormService.addRecipient(req as unknown as Request)

      expect(req.session.recipients[0]).toEqual({
        prisonerName: 'John Smith',
        prisonerDob: moment('1990-01-01', 'YYYY-MM-DD').toDate(),
        prisonAddress: aPrisonAddress(),
      })
    })

    it('should throw errors from retrieving the prison address', async () => {
      prisonRegisterService.getPrisonAddress.mockRejectedValue('some-error')
      req.session.recipientForm = aRecipientForm()

      try {
        await recipientFormService.addRecipient(req as unknown as Request)
        fail('Expected any errors to be thrown')
      } catch (error) {
        expect(error).toStrictEqual('some-error')
      }
    })
  })

  describe('addContact', () => {
    it('should save contact to recipient list', async () => {
      prisonRegisterService.getPrisonAddress.mockReturnValue(aPrisonAddress())

      await recipientFormService.addContact(req as unknown as Request, aContact())

      expect(req.session.recipients[0]).toEqual({
        prisonNumber: 'A1234BC',
        prisonerName: 'John Smith',
        prisonAddress: aPrisonAddress(),
      })
      expect(req.session.recipientForm).toStrictEqual({})
      expect(prisonRegisterService.getPrisonAddress).toHaveBeenCalledWith('LEI')
    })

    it('should save contact with DoB to recipient list', async () => {
      prisonRegisterService.getPrisonAddress.mockReturnValue(aPrisonAddress())

      await recipientFormService.addContact(req as unknown as Request, aContactDob())

      expect(req.session.recipients[0]).toEqual({
        prisonerDob: moment('1990-01-01', 'YYYY-MM-DD').toDate(),
        prisonerName: 'John Smith',
        prisonAddress: aPrisonAddress(),
      })
      expect(req.session.recipientForm).toStrictEqual({})
      expect(prisonRegisterService.getPrisonAddress).toHaveBeenCalledWith('LEI')
    })
  })
})
