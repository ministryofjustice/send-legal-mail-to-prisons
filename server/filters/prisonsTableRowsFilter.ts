import type { Prison } from 'prisonTypes'

type TableCell = {
  text?: string
  html?: string
}

export default function prisonsTableRowsFilter(prisons: Array<Prison>): Array<Array<TableCell>> {
  return prisons.map(prison => {
    return Array.of(
      { text: prison.id },
      { text: prison.name },
      {
        html: `
          <a href='/supported-prisons/remove/${prison.id}' class='govuk-link govuk-link--no-visited-state'>Remove<span class='govuk-visually-hidden'> for ${prison}</span></a>
          `,
      },
    )
  })
}
