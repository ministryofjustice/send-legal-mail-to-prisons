import renderEnvelopeSizeRadiosFilter from './renderEnvelopeSizeRadiosFilter'
import { EnvelopeSizeSpec } from '../routes/barcode/pdf/PdfControllerView'

describe('renderEnvelopeSizeRadiosFilter', () => {
  it('should render envelope size radio components', () => {
    const sizes: Array<EnvelopeSizeSpec> = [
      { key: 'some-key', label: 'some-label', description: 'some-description', width: 100, height: 200 },
    ]

    const radios = renderEnvelopeSizeRadiosFilter(sizes)

    expect(radios.length).toBe(1)
    expect(radios[0].value).toBe('some-key')
    expect(radios[0].html).toContain('some-label')
    expect(radios[0].hint.html).toContain('some-description')
    expect(radios[0].hint.html).toContain('Width: 100mm')
    expect(radios[0].hint.html).toContain('height: 200mm')
    expect(radios[0].hint.html).toContain('envelope-size-some-key.png')
  })

  it('should render multiple envelope size radio components', () => {
    const sizes: Array<EnvelopeSizeSpec> = [
      { key: 'some-key', label: 'some-label', description: 'some-description', width: 100, height: 200 },
      { key: 'some-key-2', label: 'some-label', description: 'some-description', width: 100, height: 200 },
    ]

    const radios = renderEnvelopeSizeRadiosFilter(sizes)

    expect(radios.length).toBe(2)
    expect(radios[0].value).toBe('some-key')
    expect(radios[1].value).toBe('some-key-2')
  })
})
