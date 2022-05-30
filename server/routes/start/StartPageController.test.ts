import { Request, Response } from 'express'
import StartPageController from './StartPageController'
import PrisonService from '../../services/prison/PrisonService'

const res = {
  render: jest.fn(),
  redirect: jest.fn(),
}

const prisonService = {
  getSupportedPrisons: jest.fn(),
}

describe('StartPageController', () => {
  const startPageController = new StartPageController(prisonService as unknown as PrisonService)

  prisonService.getSupportedPrisons.mockResolvedValue([
    { id: 'ASI', name: 'Ashfield (HMP & YOI)', addressName: 'HMP & YOI Ashfield' },
    { id: 'ACI', name: 'Altcourse (HMP)', addressName: 'HMP Altcourse' },
  ])

  it('should display all prison address names in alphabetical order by name (not type)', async () => {
    await startPageController.getStartPageView({} as unknown as Request, res as unknown as Response)

    expect(prisonService.getSupportedPrisons).toHaveBeenCalled()
    expect(res.render).toHaveBeenCalledWith('pages/start/legal-sender-start-page', {
      prisonNames: ['Altcourse (HMP)', 'Ashfield (HMP & YOI)'],
    })
  })
})
