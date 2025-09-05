import { type KnipConfig } from 'knip';

const config: KnipConfig = {
  compilers: {
    css: text => [...text.matchAll(/(?<=@)import[^;]+/g)].join('\n')
  },
  entry: ['proxy/index.js', 'src/index.css', 'src/main.tsx'],
  project: ['**/*.{js,ts,tsx}']
};

export default config;
