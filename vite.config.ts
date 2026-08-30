import { networkInterfaces } from 'node:os';
import { sites } from '@openai/sites-vite-plugin';
import tailwindcss from '@tailwindcss/postcss';
import { nitro } from 'nitro/vite';
import vinext from 'vinext';
import { defineConfig } from 'vite';
import hostingConfig from './.openai/hosting.json';

const SITE_CREATOR_PLACEHOLDER_DATABASE_ID =
  '00000000-0000-4000-8000-000000000000';

const { d1, r2 } = hostingConfig;

// macOS Seatbelt blocks FSEvents, so Codex previews need polling for HMR.
const isCodexSeatbeltSandbox = process.env.CODEX_SANDBOX === 'seatbelt';
const isNetlify =
  process.env.NETLIFY === 'true' || process.env.NITRO_PRESET === 'netlify';

function bookingApiOrigin(): string {
  if (process.env.BOOKING_API_ORIGIN) {
    return process.env.BOOKING_API_ORIGIN;
  }
  const publicIpv4 = Object.values(networkInterfaces())
    .flat()
    .filter((iface): iface is NonNullable<typeof iface> =>
      Boolean(iface && !iface.internal && iface.family === 'IPv4'),
    )
    .map((iface) => iface.address);
  if (publicIpv4[0]) {
    return `http://${publicIpv4[0]}:4000`;
  }
  return 'http://[::1]:4000';
}

const localBindingConfig = {
  main: 'vinext/server/app-router-entry',
  compatibility_flags: ['nodejs_compat'],
  d1_databases: d1
    ? [
        {
          binding: d1,
          database_name: 'site-creator-d1',
          database_id: SITE_CREATOR_PLACEHOLDER_DATABASE_ID,
        },
      ]
    : [],
  r2_buckets: r2
    ? [
        {
          binding: r2,
          bucket_name: 'site-creator-r2',
        },
      ]
    : [],
};

export default defineConfig(async () => {
  // Keep Wrangler and Miniflare state project-local. These are non-secret tool
  // settings; application environment belongs in ignored `.env*` files.
  process.env.WRANGLER_WRITE_LOGS ??= 'false';
  process.env.WRANGLER_LOG_PATH ??= '.wrangler/logs';
  process.env.MINIFLARE_REGISTRY_PATH ??= '.wrangler/registry';

  const plugins = [vinext()];
  if (isNetlify) {
    // Cloudflare's worker `{ fetch }` export makes Nitro SSR call rsc.default as a
    // function and 500. Use Nitro alone on Netlify.
    plugins.push(nitro());
  } else {
    // Wrangler snapshots its log path while the Cloudflare plugin is imported.
    const { cloudflare } = await import('@cloudflare/vite-plugin');
    plugins.push(
      sites(),
      cloudflare({
        viteEnvironment: { name: 'rsc', childEnvironments: ['ssr'] },
        config: localBindingConfig,
      }),
    );
  }

  return {
    css: { postcss: { plugins: [tailwindcss()] } },
    server: {
      host: '0.0.0.0',
      port: 3000,
      proxy: {
        '/v1': { target: bookingApiOrigin(), changeOrigin: true, xfwd: true },
        '/health': { target: bookingApiOrigin(), changeOrigin: true, xfwd: true },
      },
      ...(isCodexSeatbeltSandbox
        ? { watch: { useFsEvents: false, usePolling: true } }
        : {}),
    },
    plugins,
  };
});
