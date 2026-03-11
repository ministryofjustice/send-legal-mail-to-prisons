import { Request } from 'express'
import moment from 'moment'

export default function parseDob(req: Request, prefix: string): Date | undefined {
  const dobDay: string = req.body?.[`${prefix}-day`] ? (req.body[`${prefix}-day`] as string).padStart(2, '0') : ''
  const dobMonth: string = req.body?.[`${prefix}-month`] ? (req.body[`${prefix}-month`] as string).padStart(2, '0') : ''
  const dobYear: string = req.body?.[`${prefix}-year`] ? (req.body[`${prefix}-year`] as string) : ''
  if (dobDay === '' && dobMonth === '' && dobYear === '') {
    return undefined
  }
  return moment(`${dobDay}-${dobMonth}-${dobYear}`, 'DD-MM-YYYY', true).toDate()
}
