import superagent from 'superagent'
import Agent, { HttpsAgent } from 'agentkeepalive'

import logger from '../../logger'
import sanitiseError from '../sanitisedError'
import { ApiConfig } from '../config'

interface GetRequest {
  path?: string
  query?: string
  headers?: Record<string, string>
  responseType?: string
  raw?: boolean
}

interface PostRequest {
  path?: string
  headers?: Record<string, string>
  responseType?: string
  data?: Record<string, unknown>
  raw?: boolean
}

export default class RestClient {
  agent: Agent

  constructor(
    private readonly name: string,
    private readonly config: ApiConfig,
    private readonly hmppsToken: string = undefined,
    private readonly slmToken: string = undefined
  ) {
    this.agent = config.url.startsWith('https') ? new HttpsAgent(config.agent) : new Agent(config.agent)
  }

  private apiUrl() {
    return this.config.url
  }

  private timeoutConfig() {
    return this.config.timeout
  }

  private logRequest(method: string, path: string, query = '') {
    if (this.hmppsToken) {
      logger.info(`${method.toUpperCase()} request using HMPPS auth token: calling ${this.name}: ${path} ${query}`)
    } else if (this.slmToken) {
      logger.info(`${method.toUpperCase()} request using SLM token: calling ${this.name}: ${path} ${query}`)
    } else if (/https?:\/\/.+:.+@.+/.test(this.apiUrl())) {
      logger.info(`${method.toUpperCase()} request using basic auth: calling ${this.name}: ${path} ${query}`)
    } else {
      logger.info(`Anonymous ${method.toUpperCase()} request: calling ${this.name}: ${path} ${query}`)
    }
  }

  async get({ path = null, query = '', headers = {}, responseType = '', raw = false }: GetRequest): Promise<unknown> {
    this.logRequest('GET', path, query)

    const request = superagent.get(`${this.apiUrl()}${path}`)
    request
      .agent(this.agent)
      .retry(2, err => {
        if (err) logger.info(`Retry handler found API error with ${err.code} ${err.message}`)
        return undefined // retry handler only for logging retries, not to influence retry logic
      })
      .query(query)
      .set(headers)
      .responseType(responseType)
      .timeout(this.timeoutConfig())

    if (this.hmppsToken) {
      request.auth(this.hmppsToken, { type: 'bearer' })
    } else if (this.slmToken) {
      request.set('Create-Barcode-Token', this.slmToken)
    }

    return request
      .then(result => (raw ? result : result.body))
      .catch(error => {
        const sanitisedError = sanitiseError(error)
        logger.warn({ ...sanitisedError, query }, `Error calling ${this.name}, path: '${path}', verb: 'GET'`)
        throw sanitisedError
      })
  }

  async post({
    path = null,
    headers = {},
    responseType = '',
    data = {},
    raw = false,
  }: PostRequest = {}): Promise<unknown> {
    this.logRequest('POST', path)

    const request = superagent.post(`${this.apiUrl()}${path}`)
    request
      .send(data)
      .agent(this.agent)
      .retry(2, err => {
        if (err) logger.info(`Retry handler found API error with ${err.code} ${err.message}`)
        return undefined // retry handler only for logging retries, not to influence retry logic
      })
      .set(headers)
      .responseType(responseType)
      .timeout(this.timeoutConfig())

    if (this.hmppsToken) {
      request.auth(this.hmppsToken, { type: 'bearer' })
    } else if (this.slmToken) {
      request.set('Create-Barcode-Token', this.slmToken)
    }

    return request
      .then(result => (raw ? result : result.body))
      .catch(error => {
        const sanitisedError = sanitiseError(error)
        logger.warn({ ...sanitisedError }, `Error calling ${this.name}, path: '${path}', verb: 'POST'`)
        throw sanitisedError
      })
  }
}
