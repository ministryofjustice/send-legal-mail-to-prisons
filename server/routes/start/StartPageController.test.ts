import { Request, Response } from 'express'
import config from '../../config'
import StartPageController from './StartPageController'
import PrisonRegisterService from '../../services/prison/PrisonRegisterService'

const res = {
  render: jest.fn(),
  redirect: jest.fn(),
}

const prisonRegisterService = {
  getActivePrisonsFromPrisonRegister: jest.fn(),
}

describe('StartPageController', () => {
  const startPageController = new StartPageController(prisonRegisterService as unknown as PrisonRegisterService)

  config.supportedPrisons = ''
  prisonRegisterService.getActivePrisonsFromPrisonRegister.mockResolvedValue([
    { id: 'KTI', name: 'Kennet (HMP)', addressName: 'HMP Kennet' },
    { id: 'ACI', name: 'Altcourse (HMP)', addressName: 'HMP Altcourse' },
    { id: 'ASI', name: 'Ashfield (HMP)', addressName: 'HMP Ashfield' },
  ])

  it('should display all prison address names in alphabetical order', async () => {
    await startPageController.getStartPageView({} as unknown as Request, res as unknown as Response)

    expect(prisonRegisterService.getActivePrisonsFromPrisonRegister).toHaveBeenCalled()
    expect(res.render).toHaveBeenCalledWith('pages/start/legal-sender-start-page', {
      prisonNames: ['HMP Altcourse', 'HMP Ashfield', 'HMP Kennet'],
    })
  })

  it('should filter on supported prisons', async () => {
    config.supportedPrisons = 'KTI,ASI'

    await startPageController.getStartPageView({} as unknown as Request, res as unknown as Response)

    expect(res.render).toHaveBeenCalledWith('pages/start/legal-sender-start-page', {
      prisonNames: ['HMP Ashfield', 'HMP Kennet'],
    })
  })
})
