export default function validateEnvelopeSizeOption(envelopeSize: string): Array<string> {
  const errors: Array<string> = []
  if (!envelopeSize) {
    errors.push('Select an option')
  } else if (!(envelopeSize === 'dl' || envelopeSize === 'c4' || envelopeSize === 'c5')) {
    errors.push('Select an option')
  }

  return errors
}
