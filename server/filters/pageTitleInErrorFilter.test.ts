import pageTitleInErrorFilter from './pageTitleInErrorFilter'

describe('pageTitleInErrorFilter', () => {
  it('should display page title if errors missing', () => {
    expect(pageTitleInErrorFilter('title')).toStrictEqual('title')
  })

  it('should display page title if errors empty', () => {
    expect(pageTitleInErrorFilter('title', [])).toStrictEqual('title')
  })

  it('should display error prefix and page title if errors exist', () => {
    expect(pageTitleInErrorFilter('title', [{ anything: 'anything' }])).toStrictEqual('Error - title')
  })
})
