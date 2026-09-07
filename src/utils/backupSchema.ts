import { z } from 'zod'

export const MAX_BACKUP_BYTES = 512 * 1024 * 1024
export const MAX_BACKUP_FILE_BYTES = 128 * 1024 * 1024
export const MAX_MANIFEST_BYTES = 16 * 1024 * 1024
export const MAX_BACKUP_FILES = 10000
const text = z.string().max(1_000_000)
const id = z.string().min(1).max(2048)
const timestamp = z.number().finite().nonnegative()
const imagePath = z.string().regex(/^images\/[a-f0-9]{64}\.(png|jpg|webp|gif|avif|bmp|tif)$/)
const imageSlot = z.union([imagePath, z.literal('')])
const scalar = z.union([text, z.number().finite(), z.boolean(), z.null()])
const actualParams = z.object({
    provider: text.optional(), resolvedEndpoint: text.optional(), requestCount: z.number().optional(),
    n: z.union([z.number(), text]).optional(), aspectRatio: text.optional(), imageSize: text.optional(),
    outputSize: text.optional(), quality: text.optional(), autoPrompt: z.boolean().optional(),
    translate: z.boolean().optional(), referenceCount: z.number().optional(), referencePayloadField: text.optional()
})
const recipe = z.object({
    mainPrompt: text, compiledPrompt: text, supplementPrompt: text, selectedStyle: text, customPrompt: text,
    referenceImages: z.array(imageSlot).max(1000), referenceImageLabels: z.array(text).max(1000),
    referenceImageMetadata: z.array(z.object({
        role: z.enum(['character', 'outfit', 'background', 'product', 'style', 'other']), label: text, note: text.optional()
    })).max(1000),
    identityFidelity: z.enum(['free', 'balanced', 'strict']).optional(), count: z.number().int().nonnegative(),
    batchMode: z.enum(['single', 'fill']).optional()
})
const historyRecord = z.object({
    id, source: z.enum(['text', 'image']), prompt: text, model: text, endpoint: text,
    resolvedEndpoint: text.optional(), requestProvider: text.optional(), aspectRatio: text, imageSize: text,
    count: z.number().int().nonnegative().optional(), batchMode: z.enum(['single', 'fill']).optional(),
    useProxy: z.boolean().optional(), createdAt: timestamp, images: z.array(imageSlot).max(1000),
    imagePersistenceWarnings: z.array(text).max(1000).optional(), category: text.optional(), favorite: z.boolean().optional(),
    recipe: recipe.optional(), actualParams: actualParams.optional(),
    imageDetails: z.array(z.object({ index: z.number().int().nonnegative(), revisedPrompt: text.optional(), actualParams: z.record(z.string(), scalar).optional() })).max(1000).optional(),
    revisedPrompt: text.optional(), durationMs: z.number().nonnegative().optional(), redactedErrorSummary: text.optional(),
    hiddenImageIndexes: z.array(z.number().int().nonnegative()).max(1000).optional()
})
const preset = z.object({
    id, name: z.string().min(1).max(2000), apiKey: text, endpoint: z.string().min(1).max(10000),
    model: text, useProxy: z.boolean(), proxyToken: text.optional(), createdAt: timestamp, updatedAt: timestamp
})

export const backupManifestSchema = z.object({
    format: z.literal('vistack-backup'), version: z.literal(1), createdAt: z.string().datetime(), includesCredentials: z.boolean(),
    records: z.array(historyRecord).max(30000), apiPresets: z.array(preset).max(10000),
    assistantPresets: z.array(preset).max(10000), collections: z.array(z.string().max(2000)).max(10000),
    files: z.array(z.object({ path: imagePath, mime: z.string().max(100), sha256: z.string().regex(/^[a-f0-9]{64}$/), bytes: z.number().int().positive().max(MAX_BACKUP_FILE_BYTES) })).max(MAX_BACKUP_FILES),
    missingImages: z.array(z.object({ recordId: id, kind: z.enum(['generated', 'reference']), index: z.number().int().nonnegative(), reason: z.string().max(2000) })).max(30000)
})

export type BackupManifest = z.infer<typeof backupManifestSchema>
