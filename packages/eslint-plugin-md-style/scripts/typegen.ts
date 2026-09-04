import fs from 'node:fs/promises'

import { flatConfigsToRulesDTS } from 'eslint-typegen/core'
import plugin from '..'

// Generate option-aware typings for every rule exposed by the `all` config.
const moduleAugmentation = `declare module 'eslint' {
  namespace Linter {
    interface RulesRecord extends RuleOptions {}
  }
}

`
const dts = (await flatConfigsToRulesDTS([plugin.configs.all])).replace(moduleAugmentation, '')

await fs.writeFile('types/typegen.d.ts', dts)
