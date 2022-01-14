export default function initialiseNameFilter(fullName: string): string {
  // this check is for the authError page
  if (!fullName) {
    return null
  }
  const array = fullName.split(' ')
  return `${array[0][0]}. ${array.reverse()[0]}`
}
