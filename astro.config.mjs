// @ts-check
import mdx from "@astrojs/mdx"
import { defineConfig, fontProviders } from "astro/config"
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
            style: "normal",
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
  },
})
