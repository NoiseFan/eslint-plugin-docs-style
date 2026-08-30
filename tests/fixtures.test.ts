import type { Linter } from 'eslint'
import fs from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { ESLint } from 'eslint'
import { glob } from 'tinyglobby'
import { describe, it } from 'vitest'
import plugin from '../src/index'
import { getFixtureRuleOverrides } from './helpers/fixture-rule-overrides'

describe('fixtures', () => {
  runWithConfig('all', { ...plugin.configs.all })
})

function runWithConfig(name: string, configs: Linter.Config) {
  it.concurrent(name, async ({ expect }) => {
    const from = resolve('tests/fixtures/input')
    const output = resolve('tests/fixtures/output')
    const target = resolve('tests/_fixtures')

    await fs.rm(target, { recursive: true, force: true })
    await fs.cp(from, target, { recursive: true, filter: src => !src.includes('node_modules') })

    const inputFiles = await glob('**/*.md', { cwd: from, onlyFiles: true })
    const fileOverrides = await getFixtureRuleOverrides(inputFiles, from)

    const eslint = new ESLint({
      cwd: target,
      fix: true,
      overrideConfigFile: true,
      overrideConfig: [configs, ...fileOverrides.map(({ file, override }) => ({
        files: [file],
        rules: {
          [`md-style/${override.rule}`]: ['error', ...override.options] as Linter.RuleEntry,
        },
      }))],
    })
    const results = await eslint.lintFiles(['**/*.md'])
    await ESLint.outputFixes(results)

    const files = await glob('**/*', {
      cwd: target,
      onlyFiles: true,
      ignore: ['node_modules', 'eslint.config.js'],
    })

    await Promise.all(files.map(async (file) => {
      const content = await fs.readFile(join(target, file), 'utf-8')
      const source = await fs.readFile(join(from, file), 'utf-8')
      const outputPath = join(output, file)

      if (content === source) {
        await fs.rm(outputPath, { force: true })
        return
      }

      await expect.soft(content).toMatchFileSnapshot(join(output, file))
    }))
  })
}
