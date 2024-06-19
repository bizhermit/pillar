const appMode = process.env.APP_MODE;
const outputMode = process.env.NEXT_OUTPUT;

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    tsconfigPath: './src/tsconfig.json',
  },
  ...(outputMode === 'dist' ? {
    output: 'export',
    distDir: 'dist/out',
    trailingSlash: true,
  } : {}),
  ...(outputMode === 'renderer' ? {
    output: 'export',
    distDir: '.renderer',
  } : {}),
  pageExtensions: [
    'tsx', 'ts', 'mts', 'cts',
    ...(appMode === 'dev' ? ['dev.tsx', 'dev.ts', 'dev.mts', 'dev.cts'] : [])
  ],
};

export default nextConfig;
