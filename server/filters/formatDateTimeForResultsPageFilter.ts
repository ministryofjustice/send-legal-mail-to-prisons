import moment from 'moment'

export default function formatDateTimeForResultsPageFilter(value: string): string {
  const dateTime = moment(value)
  return dateTime ? dateTime.format('h:mm a [on] D MMMM YYYY') : null
}
