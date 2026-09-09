import { readFile, writeFile } from 'node:fs/promises'
import { librarySchema } from '../../src/text-library/model'
import { importLegacy } from './legacyImport'

const [auditPath, outputPath] = process.argv.slice(2)
if (!auditPath || !outputPath) throw new Error('Usage: import-legacy <color-audit.json> <preview.json>')
const audit = JSON.parse(await readFile(auditPath, 'utf8'))
const result = importLegacy(audit.paragraphs, audit.source)
const library = librarySchema.parse({ version: 1, revision: 0, quotes: result.quotes })
await writeFile(outputPath, JSON.stringify(library, null, 2), 'utf8')
console.log(JSON.stringify({ groups: result.groups, quotes: result.quotes.length, merged: result.merged,
    statusCounts: result.statusCounts, flagged: result.quotes.filter(q => q.reviewFlags.length).length,
    outputPath }, null, 2))
