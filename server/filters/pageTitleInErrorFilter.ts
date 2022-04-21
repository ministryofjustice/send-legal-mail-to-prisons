export default function pageTitleInErrorFilter(pageTitle: string, errors?: Array<Record<string, string>>): string {
  if (errors?.length > 0) {
    return `Error - ${pageTitle}`
  }
  return pageTitle
}
