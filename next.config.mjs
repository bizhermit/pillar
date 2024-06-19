const appMode = process.env.APP_MODE;

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    tsconfigPath: './src/tsconfig.json',
  },
  pageExtensions: [
    'tsx', 'ts', 'mts', 'cts',
    ...(appMode === 'dev' ? ['dev.tsx', 'dev.ts', 'dev.mts', 'dev.cts'] : [])
  ],
};

export default nextConfig;
