import fs from 'node:fs/promises'
import { basename, dirname, join } from 'node:path'
import { parse as parseYaml } from 'yaml'
import { parseMarkdown } from '@/parser/markdown'

const FIXTURE_RULE_RE = /^[\w-]+$/

export interface FixtureRuleOverride {
  rule: string
  options: unknown[]
}

/**
 * Reads per-file rule overrides from the fixture's YAML frontmatter.
 */
export async function getFixtureRuleOverrides(
  files: string[],
  inputRoot: string,
): Promise<Array<{ file: string, override: FixtureRuleOverride }>> {
  const overrides: Array<{ file: string, override: FixtureRuleOverride }> = []
  for (const file of files) {
    const source = await fs.readFile(join(inputRoot, file), 'utf-8')
    const directory = dirname(file)
    const defaultRule = directory === '.' ? undefined : basename(directory)
    const override = parseFixtureRuleOverride(source, defaultRule)
    if (override)
      overrides.push({ file, override })
  }
  return overrides
}

/**
 * Parses the intentionally small fixture metadata schema from YAML frontmatter.
 */
export function parseFixtureRuleOverride(source: string, defaultRule?: string): FixtureRuleOverride | undefined {
  const frontmatter = parseMarkdown(source).ast.children[0]
  if (frontmatter?.type !== 'yaml')
    return
  const metadata = parseYaml(frontmatter.value)
  const ruleValue = metadata.rule
  const rule = typeof ruleValue === 'string' && FIXTURE_RULE_RE.test(ruleValue)
    ? ruleValue
    : undefined
  if (!rule && !defaultRule)
    return
  const options = Array.isArray(metadata.options) ? metadata.options : []
  return { rule: rule ?? defaultRule!, options }
}
