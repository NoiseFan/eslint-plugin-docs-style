import fs from 'node:fs/promises'

import { flatConfigsToRulesDTS } from 'eslint-typegen/core'
import plugin from '../src'

// Generate option-aware typings for every rule exposed by the `all` config.
const dts = await flatConfigsToRulesDTS([plugin.configs.all])

await fs.writeFile('src/typegen.d.ts', dts)
