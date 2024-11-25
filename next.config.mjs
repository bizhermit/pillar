const appMode = process.env.APP_MODE;
const outputMode = process.env.NEXT_OUTPUT;

const isExport = ['dist', 'renderer'].includes(outputMode);

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    tsconfigPath: './src/tsconfig.json',
  },
  env: {
    APP_MODE: appMode,
    API_URL: process.env.API_URL || process.env.API_URL_IN_CLIENT,
  },
  output: isExport ? "export" : undefined,
  ...(outputMode === 'dist' ? {
    distDir: 'dist/out',
    trailingSlash: true,
  } : {}),
  ...(outputMode === 'renderer' ? {
    distDir: '.renderer',
  } : {}),
  pageExtensions: [
    ...(appMode === 'mock' ? ['mock.tsx', 'mock.ts'] : []),
    'tsx', 'ts',
  ],
  images: {
    unoptimized: isExport,
  },
};

export default nextConfig;
