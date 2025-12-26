import type { ImageMetadata } from "astro"
import { defineCollection, z } from "astro:content"

const coverImages = import.meta.glob<{ default: ImageMetadata }>(
  "./assets/sync/gallery-covers/*.{jpg,jpeg,png}",
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
        slug: z.string(),
        type: z.enum(["works", "series", "process"]),
        newsletterUrl: z.string().url().optional(),
      })
      .transform((data) => {
        const cover =
          coverImages[`./assets/sync/gallery-covers/${data.slug}.jpg`] ??
          coverImages[`./assets/sync/gallery-covers/${data.slug}.jpeg`] ??
          coverImages[`./assets/sync/gallery-covers/${data.slug}.png`]

        return {
          ...data,
          cover: cover?.default,
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
