let smokeTestBarcode: string
const setSmokeTestBarcode = val => {
  smokeTestBarcode = val
  return null
}
const getSmokeTestBarcode = (): string => {
  return smokeTestBarcode
}

export default {
  setSmokeTestBarcode,
  getSmokeTestBarcode,
}
