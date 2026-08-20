import { parseCustomContainers } from '@/utils/custom-container'

describe('test', () => {
  it('finds nested and direct child containers and calculates depth', async () => {
    const markdown = [
      '::: info TITLE',
      '',
      'a',
      '',
      '::: tip',
      '',
      'b',
      '',
      ':::',
      ':::',
    ]
    /**
     * ::: info
     * a
     * ::: tip
     * b
     * :::
     * :::
     */
    await expect(JSON.stringify(parseCustomContainers(markdown.join('\n')), null, 2)).toMatchFileSnapshot('__snapshots__/custom-container/demo.json')
  })
})
