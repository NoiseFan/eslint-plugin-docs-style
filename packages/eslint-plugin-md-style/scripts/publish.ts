import { execSync } from 'node:child_process'
import { version } from '../package.json'

let command = 'npm publish'

if (version.includes('beta'))
  command += ' --tag beta'

if (version.includes('alpha'))
  command += ' --tag alpha'

execSync(command, { stdio: 'inherit' })
