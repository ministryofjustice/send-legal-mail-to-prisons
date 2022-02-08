const MAX_FILE_SIZE = 20 * 1024 * 1024
const SUPPORTED_MIME_TYPES = ['image/jpg', 'image/jpeg', 'image/bmp', 'image/png', 'image/tif', 'application/pdf']

export default function validateUpload(upload: Express.Multer.File): Array<string> {
  const errors: Array<string> = []

  if (!upload) {
    return errors
  }

  if (upload.size > MAX_FILE_SIZE) {
    errors.push('The selected file must be smaller than 20MB')
  } else if (upload.size < 1) {
    errors.push('The selected file cannot be empty')
  }

  if (!SUPPORTED_MIME_TYPES.includes(upload.mimetype)) {
    errors.push('The selected file must be a JPG, JPEG, BMP, PNG, TIF, or PDF')
  }

  return errors
}
