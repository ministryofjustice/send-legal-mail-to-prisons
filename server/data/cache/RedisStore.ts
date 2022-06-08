import logger from '../../../logger'
import type { RedisClient } from './RedisClient'

export default abstract class RedisStore {
  protected constructor(private readonly client: RedisClient) {
    client.on('error', error => {
      logger.error(error, `Redis error`)
    })
  }

  private async ensureConnected() {
    if (!this.client.isOpen) {
      await this.client.connect()
    }
  }

  public async setEntry(key: string, token: string, durationSeconds: number): Promise<void> {
    await this.ensureConnected()
    await this.client.set(`${key}`, token, { EX: durationSeconds })
  }

  public async getEntry(key: string): Promise<string> {
    await this.ensureConnected()
    return this.client.get(`${key}`)
  }

  protected async deleteEntry(key: string) {
    await this.ensureConnected()
    this.client.del(key)
  }
}
