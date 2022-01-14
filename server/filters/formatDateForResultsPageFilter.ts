import moment from 'moment'

export default function formatDateForResultsPageFilter(value: string): string {
  const dateTime = moment(value)
  return dateTime ? dateTime.format('D MMMM YYYY') : null
}
