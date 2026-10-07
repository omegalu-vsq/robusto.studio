import react from '@vitejs/plugin-react'
import { createReadStream, readFileSync, readdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import { defineConfig } from 'vite'

const require = createRequire(import.meta.url)
const pdfjsPath = path.dirname(require.resolve('pdfjs-dist/package.json'))

function pdfjsAssets() {
  const resources = ['cmaps', 'standard_fonts', 'wasm'].flatMap((directory) =>
    readdirSync(path.join(pdfjsPath, directory)).map((filename) => ({
      url: `/pdfjs/${directory}/${filename}`,
      source: path.join(pdfjsPath, directory, filename),
    })),
  )
  const byUrl = new Map(resources.map((resource) => [resource.url, resource]))

  return {
    name: 'pdfjs-assets',
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const resource = byUrl.get(request.url?.split('?')[0])
        if (!resource) return next()
        const contentType = resource.url.endsWith('.wasm')
          ? 'application/wasm'
          : resource.url.endsWith('.js') ? 'text/javascript' : 'application/octet-stream'
        response.setHeader('Content-Type', contentType)
        createReadStream(resource.source).on('error', next).pipe(response)
      })
    },
    buildStart() {
      for (const resource of resources) {
        this.emitFile({
          type: 'asset',
          fileName: resource.url.slice(1),
          source: readFileSync(resource.source),
        })
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), pdfjsAssets()],
})
