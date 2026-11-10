import { describe, expect, test } from "bun:test"
import { fetchGalleryObject } from "./fetch-gallery-object"

const url = "https://example.test/object"
const key = "gallery/image.jpg"

describe("fetchGalleryObject", () => {
  test("retries server errors and returns the downloaded body", async () => {
    let calls = 0
    const delays: number[] = []
    const fetchObject = (async () => {
      calls++
      return calls === 1
        ? new Response(null, { status: 500 })
        : new Response("image data")
    }) as typeof fetch
    const bytes = await fetchGalleryObject(url, key, {
      fetch: fetchObject,
      wait: async (ms) => {
        delays.push(ms)
      },
    })
    expect(new TextDecoder().decode(bytes)).toBe("image data")
    expect(calls).toBe(2)
    expect(delays).toEqual([1000])
  })

  test("honors Retry-After for a rate limit", async () => {
    let calls = 0
    const delays: number[] = []
    const fetchObject = (async () => {
      calls++
      return calls === 1
        ? new Response(null, { status: 429, headers: { "Retry-After": "3" } })
        : new Response("ok")
    }) as typeof fetch
    await fetchGalleryObject(url, key, {
      fetch: fetchObject,
      wait: async (ms) => {
        delays.push(ms)
      },
    })
    expect(delays).toEqual([3000])
  })

  test("retries an interrupted response body", async () => {
    let calls = 0
    const fetchObject = (async () => {
      calls++
      const response = new Response("image data")
      if (calls === 1) {
        response.arrayBuffer = async () => {
          throw new Error("connection reset")
        }
      }
      return response
    }) as typeof fetch
    const bytes = await fetchGalleryObject(url, key, {
      fetch: fetchObject,
      wait: async () => {},
    })
    expect(new TextDecoder().decode(bytes)).toBe("image data")
    expect(calls).toBe(2)
  })

  test("fails immediately on a non-retryable response", async () => {
    let calls = 0
    const fetchObject = (async () => {
      calls++
      return new Response(null, { status: 403 })
    }) as typeof fetch
    await expect(
      fetchGalleryObject(url, key, { fetch: fetchObject }),
    ).rejects.toThrow("403")
    expect(calls).toBe(1)
  })

  test("reports a persistent server error after the last attempt", async () => {
    let calls = 0
    const fetchObject = (async () => {
      calls++
      return new Response(null, { status: 500 })
    }) as typeof fetch
    await expect(
      fetchGalleryObject(url, key, { fetch: fetchObject, wait: async () => {} }),
    ).rejects.toThrow(`Failed to fetch ${key}: 500`)
    expect(calls).toBe(5)
  })

  test("stops after repeated network failures", async () => {
    let calls = 0
    const delays: number[] = []
    const fetchObject = (async () => {
      calls++
      throw new TypeError("connection reset")
    }) as typeof fetch
    await expect(
      fetchGalleryObject(url, key, {
        fetch: fetchObject,
        wait: async (ms) => {
          delays.push(ms)
        },
      }),
    ).rejects.toThrow("network error after 5 attempts")
    expect(calls).toBe(5)
    expect(delays).toEqual([1000, 2000, 4000, 8000])
  })
})
