type Error = {
  href?: string
  text?: string
}

export default function findErrorFilter(array: Error[], formFieldId: string): Error {
  const item = array?.find(error => error.href === `#${formFieldId}`)
  return item ? { text: item.text } : null
}
