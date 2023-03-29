import superagent from 'superagent'
import type { Response, ResponseError } from 'superagent'
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

interface PutRequest {
  path?: string
  headers?: Record<string, string>
  responseType?: string
  data?: Record<string, unknown>
  raw?: boolean
}

interface DeleteRequest {
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
    private readonly slmToken: string = undefined,
    private readonly sourceIp: string = undefined
  ) {
    this.agent = config.url.startsWith('https') ? new HttpsAgent(config.agent) : new Agent(config.agent)
  }

  private apiUrl() {
    return this.config.url
  }

  private basicAuth() {
    return this.config.basicAuth
  }

  private timeoutConfig() {
    return this.config.timeout
  }

  private logRequest(method: string, path: string, query = '') {
    if (this.hmppsToken) {
      logger.info(`${method.toUpperCase()} request using HMPPS auth token: calling ${this.name}: ${path} ${query}`)
    } else if (this.slmToken) {
      logger.info(`${method.toUpperCase()} request using SLM token: calling ${this.name}: ${path} ${query}`)
    } else if (this.basicAuth()) {
      logger.info(`${method.toUpperCase()} request using basic auth: calling ${this.name}: ${path} ${query}`)
    } else {
      logger.info(`Anonymous ${method.toUpperCase()} request: calling ${this.name}: ${path} ${query}`)
    }
  }

  async get({ path = null, query = '', headers = {}, responseType = '', raw = false }: GetRequest): Promise<unknown> {
    return this.processRequest({ path, headers, responseType, query, raw, method: 'get' })
  }

  async post({
    path = null,
    headers = {},
    responseType = '',
    data = {},
    raw = false,
  }: PostRequest = {}): Promise<unknown> {
    return this.processRequest({ path, headers, responseType, data, raw, method: 'post' })
  }

  async put({
    path = null,
    headers = {},
    responseType = '',
    data = {},
    raw = false,
  }: PutRequest = {}): Promise<unknown> {
    return this.processRequest({ path, headers, responseType, data, raw, method: 'put' })
  }

  async delete({
    path = null,
    headers = {},
    responseType = '',
    data = {},
    raw = false,
  }: DeleteRequest = {}): Promise<unknown> {
    return this.processRequest({ path, headers, responseType, data, raw, method: 'delete' })
  }

  private async processRequest({
    path = null,
    headers = {},
    responseType = '',
    query = undefined,
    data = undefined,
    raw = false,
    method = undefined as 'get' | 'post' | 'put' | 'delete',
  } = {}): Promise<unknown> {
    this.logRequest(method.toUpperCase(), path)

    const request = superagent[method](`${this.apiUrl()}${path}`)
    request
      .agent(this.agent)
      .retry(2, (err: ResponseError): void => {
        if (err) logger.info(`Retry handler found API error with ${err.status} ${err.message}`)
        return undefined // retry handler only for logging retries, not to influence retry logic
      })
      .set(headers)
      .responseType(responseType)
      .timeout(this.timeoutConfig())

    if (data) {
      request.send(data)
    }
    if (query) {
      request.query(query)
    }

    if (this.hmppsToken) {
      request.auth(this.hmppsToken, { type: 'bearer' })
    } else if (this.slmToken) {
      request.set('Create-Barcode-Token', this.slmToken)
    } else if (this.basicAuth()) {
      request.auth(this.basicAuth().user, this.basicAuth().pass, { type: 'basic' })
    }

    if (this.sourceIp) {
      request.set('x-slm-client-ip', this.sourceIp)
    }

    return request
      .then((result: Response) => (raw ? result : result.body))
      .catch((error: ResponseError): void => {
        const sanitisedError = sanitiseError(error)
        logger.warn({ ...sanitisedError }, `Error calling ${this.name}, path: '${path}', verb: ${method.toUpperCase()}`)
        throw sanitisedError
      })
  }
}
