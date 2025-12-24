import { rm } from "node:fs/promises"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { S3Client } from "bun"

const bucket = "cbcampbell-com"

if (!process.env.BACKBLAZE_B2_KEY || !process.env.BACKBLAZE_B2_SECRET_KEY) {
  throw new Error("Missing BACKBLAZE_B2_KEY or BACKBLAZE_B2_SECRET_KEY")
}

const credentials = {
  accessKeyId: process.env.BACKBLAZE_B2_KEY,
  secretAccessKey: process.env.BACKBLAZE_B2_SECRET_KEY,
  bucket,
  acl: "public-read",
  endpoint: "https://s3.us-west-001.backblazeb2.com",
  region: "us-west-001",
}

type S3Object = { key: string }

const outputDir = fileURLToPath(new URL("../src/assets/sync", import.meta.url))

function isValidKey(key: string | undefined): key is string {
  return Boolean(key && !key.endsWith("/") && !key.includes("\0"))
}

async function listAllObjects() {
  const objects: S3Object[] = []
  let startAfter: string | undefined

  while (true) {
    const response = await S3Client.list({ startAfter }, credentials)

    const contents = response?.contents ?? []
    for (const entry of contents) {
      if (isValidKey(entry?.key)) objects.push({ key: entry.key })
    }

    if (!response?.isTruncated) break
    startAfter = contents.at(-1)?.key
    if (!startAfter) break
  }

  return objects
}

async function downloadObject(key: string) {
  if (!isValidKey(key)) {
    console.warn("Skipping invalid key", key)
    return false
  }

  const targetPath = join(outputDir, key)

  try {
    const url = S3Client.presign(key, credentials)
    const res = await fetch(url)
    if (!res.ok) {
      throw new Error(`Failed to fetch ${key}: ${res.status} ${res.statusText}`)
    }
    const body = await res.arrayBuffer()
    await Bun.write(targetPath, body, { createPath: true })
    return true
  } catch (error) {
    console.error("Failed writing key", key, "to", targetPath, error)
    throw error
  }
}

async function syncGalleries() {
  if (process.argv.includes("--clear")) {
    await rm(outputDir, { recursive: true, force: true })
    console.log("Cleared sync directory", outputDir)
  }

  const objects = await listAllObjects()
  const seenDirs = new Set<string>()
  let syncedCount = 0

  for (const { key } of objects) {
    const dir = key.includes("/") ? key.split("/")[0] : undefined
    if (dir && !seenDirs.has(dir)) {
      console.log("Syncing directory", dir)
      seenDirs.add(dir)
    }

    const synced = await downloadObject(key)
    if (synced) syncedCount += 1
  }

  return syncedCount
}

if (import.meta.main) {
  syncGalleries()
    .then((count) => {
      console.log(`Synced ${count} objects to src/assets/sync`)
    })
    .catch((error) => {
      console.error("Failed to sync galleries", error)
      process.exit(1)
    })
}
