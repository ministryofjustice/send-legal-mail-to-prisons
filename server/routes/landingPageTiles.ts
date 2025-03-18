const landingPageTiles = Array.of(
  {
    id: 'scan-barcode',
    heading: 'Check Rule 39 mail',
    description: 'Scan barcodes on mail from law firms and other approved senders.',
    href: '/scan-barcode',
    roles: ['ROLE_SLM_SCAN_BARCODE'],
    enabled: true,
  },
  {
    id: 'supported-prisons',
    heading: 'Manage supported prisons',
    description: 'Add and remove prisons available to legal mail senders.',
    href: '/supported-prisons',
    roles: ['ROLE_SLM_ADMIN'],
    enabled: true,
  },
)

export default landingPageTiles
