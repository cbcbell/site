import { defineCollection } from "astro:content"
import { glob } from "astro/loaders"
import { z } from "astro/zod"

const newsletters = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/newsletters" }),
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
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/galleries" }),
  schema: () =>
    z
      .object({
        title: z.string(),
        type: z.enum(["works", "series", "process", "shared"]),
        typeSlug: z.string(),
        newsletterUrl: z.string().url().optional(),
        order: z.number().optional(),
      })
      .transform((data) => {
        const coverSlug = `${data.type}-${data.typeSlug}`

        return {
          ...data,
          cover: undefined,
          coverSlug,
          coverUrl: `https://s3.us-west-001.backblazeb2.com/cbcampbell-com/gallery-covers/${coverSlug}.jpg`,
        }
      }),
})

const workingVocabulary = defineCollection({
  loader: glob({
    pattern: "**/*.mdx",
    base: "./src/content/workingVocabulary",
  }),
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
