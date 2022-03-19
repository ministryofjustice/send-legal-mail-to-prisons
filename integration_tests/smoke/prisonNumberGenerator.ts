export default function generateRandomPrisonNumber(): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const randomLetter = (): string => {
    return alphabet[Math.floor(Math.random() * alphabet.length)]
  }
  const randomNumber = (): string => {
    return Math.floor(Math.random() * 10).toString()
  }

  return `${randomLetter()}${randomNumber()}${randomNumber()}${randomNumber()}${randomNumber()}${randomLetter()}${randomLetter()}`
}
