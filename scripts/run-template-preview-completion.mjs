import { createReadStream, existsSync } from 'node:fs'
import { basename, resolve } from 'node:path'
import { spawn } from 'node:child_process'
import { createInterface } from 'node:readline'

const projectRoot = resolve(import.meta.dirname, '..')
const planPath = resolve(projectRoot, 'scripts/template-preview-completion.jsonl')
const codexImageScript = resolve(process.env.USERPROFILE, '.codex/skills/codex-image/scripts/codex_image.py')
const pythonExecutable = process.env.CODEX_IMAGE_PYTHON || resolve(
    process.env.USERPROFILE,
    '.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe'
)

const hairstyleByTemplate = {
    'kbo-broadcast-identity-anchor': 2,
    'magazine-cover': 3,
    'poster-key-visual': 2,
    'beauty-editorial': 3,
    'mv-concept-still': 3,
    'album-photobook': 3,
    'photocard-portrait': 1,
    'artist-profile-photo': 1,
    'comeback-teaser-poster': 3,
    'editorial-fashion-fullbody': 3,
    'korean-ootd-mirror': 2,
    'idol-backstage-selfie': 2,
    'fancam-cover': 2,
    'airport-preview': 2,
    'after-work-preview': 2,
    'korean-cafe-snapshot': 2,
    'street-paparazzi': 3,
    'cinematic-environment': 3,
    'gpt-image2-edit-identity-scene': 3,
    'gpt-image2-edit-outfit-only': 3,
    'gpt-image2-edit-background-only': 3,
    'gpt-image2-edit-multi-reference': 3,
    'gpt-image2-edit-local-detail': 3
}

const hairstyleLabels = {
    1: 'long straight black hair with soft eyebrow-length bangs',
    2: 'clean high ponytail with a softly exposed forehead',
    3: 'long loose dark-brown waves with a center part'
}

const args = process.argv.slice(2)
const identityImages = []
let dryRun = false
let resume = false
let concurrency = 2

for (let index = 0; index < args.length; index += 1) {
    if (args[index] === '--identity-image') {
        identityImages.push(resolve(args[index + 1]))
        index += 1
    } else if (args[index] === '--dry-run') {
        dryRun = true
    } else if (args[index] === '--resume') {
        resume = true
    } else if (args[index] === '--concurrency') {
        concurrency = Number.parseInt(args[index + 1], 10)
        index += 1
    } else {
        throw new Error(`Unknown argument: ${args[index]}`)
    }
}

if (identityImages.length !== 3) {
    throw new Error('Pass exactly three --identity-image paths in reference order 1, 2, 3.')
}
if (!Number.isInteger(concurrency) || concurrency < 1 || concurrency > 2) {
    throw new Error('--concurrency must be 1 or 2.')
}
for (const imagePath of identityImages) {
    if (!existsSync(imagePath)) throw new Error(`Identity image does not exist: ${imagePath}`)
}
if (!existsSync(codexImageScript)) throw new Error(`codex-image script does not exist: ${codexImageScript}`)
if (!existsSync(pythonExecutable)) throw new Error(`Python executable does not exist: ${pythonExecutable}`)

const jobs = []
const input = createInterface({ input: createReadStream(planPath), crlfDelay: Infinity })
for await (const line of input) {
    if (line.trim()) jobs.push(JSON.parse(line))
}

if (jobs.length !== 25) throw new Error(`Expected 25 jobs, found ${jobs.length}.`)

const outputIds = jobs.map(job => basename(job.out, '.webp'))
if (new Set(outputIds).size !== jobs.length) throw new Error('Preview output IDs must be unique.')
for (const job of jobs) {
    if (!dryRun && !resume && existsSync(job.out)) {
        throw new Error(`Refusing to overwrite existing preview: ${job.out}`)
    }
}

function runCodexImage(job, index) {
    const outputId = basename(job.out, '.webp')
    const hairstyleIndex = hairstyleByTemplate[outputId]
    const isIdentityJob = hairstyleIndex !== undefined
    const prompt = isIdentityJob
        ? `Use the supplied portrait as the strongest and only facial identity anchor. The result must depict the same adult woman, not a similar-looking replacement. Preserve her facial geometry, eye shape and spacing, nose, lips, skin tone, age impression, and small beauty mark. For this result, preserve the portrait hairstyle: ${hairstyleLabels[hairstyleIndex]}. The portrait is a clean front view, so naturally extrapolate the requested pose, body, camera, clothing, and environment without changing identity. ${job.prompt} Final identity lock: depict the exact woman from the supplied portrait with ${hairstyleLabels[hairstyleIndex]}; ignore any conflicting hairstyle or generic facial description elsewhere in the art brief.`
        : job.prompt

    const commandArgs = [
        codexImageScript,
        isIdentityJob ? 'edit' : 'generate',
        '--model', job.model,
        '--size', job.size,
        '--quality', job.quality,
        '--format', job.format,
        '--compression', String(job.compression),
        '--n', String(job.n),
        '--out', job.out,
        '--prompt', prompt
    ]

    if (isIdentityJob) {
        commandArgs.push('--image', identityImages[hairstyleIndex - 1], '--input-fidelity', 'high')
    }
    if (dryRun) commandArgs.push('--dry-run')

    return new Promise((resolveJob, rejectJob) => {
        process.stdout.write(`[${index + 1}/${jobs.length}] ${outputId} (${isIdentityJob ? `identity ${hairstyleIndex}` : 'generate'})\n`)
        const childEnv = { ...process.env }
        delete childEnv.CODEX_THREAD_ID
        delete childEnv.CODEX_SESSION_ID
        const child = spawn(pythonExecutable, commandArgs, {
            cwd: projectRoot,
            env: childEnv,
            stdio: dryRun ? ['ignore', 'ignore', 'pipe'] : 'inherit',
            windowsHide: true
        })
        let stderr = ''
        if (dryRun) child.stderr.on('data', chunk => { stderr += chunk.toString() })
        child.on('error', rejectJob)
        child.on('exit', code => {
            if (code === 0) resolveJob()
            else rejectJob(new Error(`${outputId} failed with exit code ${code}${stderr ? `: ${stderr.trim()}` : ''}`))
        })
    })
}

let nextJobIndex = 0
let firstFailure
let skippedJobs = 0

async function worker() {
    while (!firstFailure) {
        const index = nextJobIndex
        nextJobIndex += 1
        if (index >= jobs.length) return
        if (!dryRun && resume && existsSync(jobs[index].out)) {
            skippedJobs += 1
            process.stdout.write(`[${index + 1}/${jobs.length}] ${basename(jobs[index].out, '.webp')} (skip existing)\n`)
            continue
        }
        try {
            await runCodexImage(jobs[index], index)
        } catch (error) {
            firstFailure = error
        }
    }
}

await Promise.all(Array.from({ length: dryRun ? 1 : concurrency }, () => worker()))
if (firstFailure) throw firstFailure

process.stdout.write(
    `${dryRun ? 'Dry-run' : 'Generation'} completed for ${jobs.length - skippedJobs} jobs; skipped ${skippedJobs} existing outputs; no retries.\n`
)
