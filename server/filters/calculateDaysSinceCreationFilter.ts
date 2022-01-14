import moment from 'moment'

export default function calculateDaysSinceCreationFilter(value: string): number {
  const dateTime = moment(value)
  const now = moment()
  return dateTime ? now.diff(dateTime, 'days') : null
}
