import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    dedupe: ['vue', '@wagmi/core', '@wagmi/vue', '@1001-digital/components', '@1001-digital/components.evm'],
  },
  optimizeDeps: {
    exclude: ['@1001-digital/components', '@1001-digital/components.evm'],
    include: [
      '@metamask/sdk',
      'eventemitter3',
      'qrcode',
      '@walletconnect/ethereum-provider',
      '@reown/appkit/core',
      '@safe-global/safe-apps-sdk',
      '@safe-global/safe-apps-provider',
    ],
  },
})
