import moment from 'moment'

export default function formatDateFilter(value: string, pattern: string): string {
  const dateTime = moment(value || null, true)
  return dateTime && dateTime.isValid() ? dateTime.format(pattern) : value
}
