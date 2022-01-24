export default function validateBarcodeOption(barcodeOption: string): Array<string> {
  const errors: Array<string> = []
  if (!barcodeOption) {
    errors.push('Select an option')
  } else if (!(barcodeOption === 'image' || barcodeOption === 'coversheet')) {
    errors.push('Select an option')
  }

  return errors
}
