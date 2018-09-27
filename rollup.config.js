import {terser} from 'rollup-plugin-terser';

function getConfig ({format = 'cjs', min = false}) {
  return {
    input: 'core.js',
    // --comments=/^!/
    plugins: [
      min ? terser() : undefined
    ],
    output: {
      format,
      file: {
        cjs: `cjs/index${min ? '.min' : ''}.js`,
        es: `esm/index${min ? '.min' : ''}.js`,
        iife: min ? 'min.js' : 'index.js'
      }[format],
      name: 'consolemd'
    }
  };
}

export default [
  getConfig({format: 'cjs', min: false}),
  getConfig({format: 'iife', min: false}),
  getConfig({format: 'iife', min: true}),
  getConfig({format: 'es', min: true}),
  getConfig({format: 'es', min: false})
];
