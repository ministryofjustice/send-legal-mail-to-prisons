import { Request, Response } from 'express'
import SupportedPrisonsController from './SupportedPrisonsController'

const req = {
  flash: jest.fn(),
} as unknown as Request
const res = {
  render: jest.fn(),
} as unknown as Response

describe('SupportedPrisonsController', () => {
  const supportedPrisonsController = new SupportedPrisonsController()

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should render page', async () => {
    await supportedPrisonsController.getSupportedPrisonsView(req, res)

    expect(res.render).toHaveBeenCalledWith('pages/prisons/supported-prisons', { errors: [] })
    expect(req.flash).toHaveBeenCalledWith('errors')
  })
})
