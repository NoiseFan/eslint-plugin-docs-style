import fs from 'node:fs/promises'

import { rules } from '../rules'

const readmePath = '../../README.md'
const readme = await fs.readFile(readmePath, 'utf8')
const table = [
  '| Rule | Included in `recommended` | Autofix |',
  '| --- | --- | --- |',
  ...Object.entries(rules)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, rule]) => {
      const recommended = rule.meta?.docs?.recommended ? '✅' : ''
      const autofix = rule.meta?.fixable ? '🔧' : ''
      return `| \`md-style/${name}\` | ${recommended} | ${autofix} |`
    }),
].join('\n')

const tablePattern = /(## Rules\n\n)(\| Rule \| Included in `recommended` \| Autofix \|[\s\S]*?)(\n## Why)/
if (!tablePattern.test(readme))
  throw new Error('Could not find the rules table in README.md')

const updated = readme.replace(
  tablePattern,
  `$1${table}\n$3`,
)

await fs.writeFile(readmePath, updated)
await fs.writeFile('README.md', updated)
