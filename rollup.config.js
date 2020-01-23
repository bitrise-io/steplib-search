import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import typescript from 'rollup-plugin-typescript';
import builtins from 'rollup-plugin-node-builtins';

import pkg from './package.json';

export default [
  // UMD
  {
    input: 'src/index.ts',
    output: {
      name: 'bitriseSteplib',
      file: pkg.browser,
      format: 'umd'
    },
    plugins: [
      resolve({
        browser: true,
        preferBuiltins: true
      }),
      commonjs(),
      typescript(),
      builtins()
    ]
  },

  // CommonJS
  {
    input: 'src/index.ts',
    external: ['algoliasearch'],
    plugins: [typescript(), builtins()],
    output: [
      { file: pkg.main, format: 'cjs' },
      { file: pkg.module, format: 'es' }
    ]
  }
];
