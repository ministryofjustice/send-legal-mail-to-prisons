import request from 'supertest'
import express from 'express'
import app from './index'

jest.mock('redis', () => jest.requireActual('redis-mock'))

describe('app', () => {
  const application: express.Application = app()

  it('should bootstrap the application', async () => {
    const response = await request(application).get('/link/request-link')

    expect(response.statusCode).toBe(200)
  })
})
