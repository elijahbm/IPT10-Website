import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Vite does not copy .env values onto process.env, so read them explicitly.
  const env = loadEnv(mode, process.cwd(), '')
  const apiPort = env.PORT || '4242'

  return {
    plugins: [react()],
    server: {
      // Forward /api/* to the payment server so the browser only ever talks to
      // one origin and the Stripe secret key stays on the server.
      proxy: {
        '/api': {
          target: `http://127.0.0.1:${apiPort}`,
          changeOrigin: true,
        },
      },
    },
  }
})
