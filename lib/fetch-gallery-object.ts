const maxAttempts = 5
const maxRetryAfterMs = 30_000

const wait = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms))

type Options = {
  fetch?: typeof fetch
  wait?: (ms: number) => Promise<void>
}

export async function fetchGalleryObject(
  url: string,
  key: string,
  options: Options = {},
): Promise<ArrayBuffer> {
  const fetchObject = options.fetch ?? fetch
  const delay = options.wait ?? wait

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    let response: Response | undefined
    try {
      response = await fetchObject(url)
      if (response.ok) return await response.arrayBuffer()
    } catch {
      // Treat failed connections and interrupted response bodies alike.
      response = undefined
    }

    const reason = response
      ? `${response.status} ${response.statusText}`.trim()
      : "network error"
    const error = `Failed to fetch ${key}: ${reason}`
    const retryable =
      !response ||
      response.status === 408 ||
      response.status === 429 ||
      response.status >= 500
    if (!retryable) throw new Error(error)
    if (attempt === maxAttempts) {
      throw new Error(response ? error : `${error} after ${attempt} attempts`)
    }

    const retryAfter = response?.headers.get("retry-after")
    const retryAfterMs =
      retryAfter && /^\d+$/.test(retryAfter) ? Number(retryAfter) * 1000 : 0
    if (retryAfterMs > maxRetryAfterMs) {
      throw new Error(`${error} (Retry-After exceeds 30 seconds)`)
    }
    await response?.body?.cancel().catch(() => {})
    console.warn(
      `Retrying ${key} after ${reason} (attempt ${attempt + 1}/${maxAttempts})`,
    )
    await delay(Math.max(1000 * 2 ** (attempt - 1), retryAfterMs))
  }

  throw new Error(`Failed to fetch ${key}`)
}
