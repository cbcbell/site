// @ts-check
import mdx from "@astrojs/mdx"
import { defineConfig } from "astro/config"
import { fileURLToPath } from "node:url"
import tailwindcss from "@tailwindcss/vite"

// https://astro.build/config
export default defineConfig({
  integrations: [mdx()],
  experimental: {
    fonts: [
      /*
      {
        name: "Geist",
        cssVariable: "--font-geist",
        fallbacks: ["system-ui", "sans-serif"],
        provider: fontProviders.google(),
        weights: ["400", "600"],
      },
      */
      {
        name: "ABCCameraPlain",
        cssVariable: "--font-camera-plain",
        provider: "local",
        variants: [
          {
            src: [
              "./src/assets/fonts/ABCCameraPlainVariableEdu-Regular.woff2",
              "./src/assets/fonts/ABCCameraPlainVariableEdu-Regular.woff",
            ],
          },
        ],
      },
    ],
  },
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
  redirects: {
    "/paintings": "/works/paintings",
    "/drawings": "/works/paper",
    "/photographs": "/works/photographs",
    "/painting-process": "/process/painting",
    "/photo-process": "/process/photo",
  },
})
