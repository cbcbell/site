// @ts-check
import mdx from "@astrojs/mdx"
import react from "@astrojs/react"
import { defineConfig, fontProviders } from "astro/config"
import { fileURLToPath } from "node:url"
import tailwindcss from "@tailwindcss/vite"

// https://astro.build/config
export default defineConfig({
  integrations: [mdx(), react()],
  fonts: [
    {
      name: "ABCCameraPlain",
      cssVariable: "--font-camera-plain",
      provider: fontProviders.local(),
      options: {
        variants: [
          {
            src: [
              "./src/assets/fonts/ABCCameraPlainVariableEdu-Regular.woff2",
              "./src/assets/fonts/ABCCameraPlainVariableEdu-Regular.woff",
            ],
          },
        ],
      },
    },
  ],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "~": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
  },
  image: {
    domains: ["s3.us-west-001.backblazeb2.com"],
  },
  prefetch: {
    defaultStrategy: "viewport",
  },
  redirects: {
    "/paintings": "/works/paintings",
    "/drawings": "/works/paper",
    "/photographs": "/works/photographs",
    "/painting-process": "/process/painting",
    "/photo-process": "/process/photo",
  },
})
