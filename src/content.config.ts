import type { ImageMetadata } from "astro"
import { defineCollection, z } from "astro:content"

const coverImages = import.meta.glob<{ default: ImageMetadata }>(
  "~/assets/sync/gallery-covers/*.{jpg,jpeg,png}",
  { eager: true },
)

const newsletters = defineCollection({
  type: "content",
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.date(),
      url: z.string().url(),
      image: image(),
      imageAlt: z.string().optional(),
    }),
})

const galleries = defineCollection({
  type: "content",
  schema: () =>
    z
      .object({
        title: z.string(),
        type: z.enum(["works", "series", "process"]),
        typeSlug: z.string(),
        newsletterUrl: z.string().url().optional(),
        order: z.number().optional(),
      })
      .transform((data) => {
        const coverSlug = `${data.type}-${data.typeSlug}`
        const cover =
          coverImages[`/src/assets/sync/gallery-covers/${coverSlug}.jpg`] ??
          coverImages[`/src/assets/sync/gallery-covers/${coverSlug}.jpeg`] ??
          coverImages[`/src/assets/sync/gallery-covers/${coverSlug}.png`]

        return {
          ...data,
          cover: cover?.default,
          coverUrl: `https://s3.us-west-001.backblazeb2.com/cbcampbell-com/gallery-covers/${data.type}-${data.typeSlug}.jpg`,
        }
      }),
})

const workingVocabulary = defineCollection({
  type: "content",
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      lang: z.enum(["en", "fr", "zh"]),
      sections: z.array(
        z.object({
          heading: z.string(),
          body: z.string(),
        }),
      ),
    }),
})

export const collections = {
  newsletters,
  galleries,
  workingVocabulary,
}
