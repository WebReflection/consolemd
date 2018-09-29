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
      exports: 'named',
      file: {
        cjs: `cjs/index${min ? '.min' : ''}.js`,
        es: `esm/index${min ? '.min' : ''}.js`,
        iife: min ? 'min.js' : 'index.js'
      }[format],
      name: 'consolemd',
      outro: format === 'cjs' ? 'module.exports = exports.default;' : ''
    }
  };
}

export default [
  getConfig({format: 'cjs', min: false}),
  getConfig({format: 'iife', min: false}),
  getConfig({format: 'iife', min: true}),
  getConfig({format: 'es', min: true}),
  getConfig({format: 'es', min: false}),
  {
    input: 'test/test.js',
    output: {
      format: 'cjs',
      file: 'test/test-cjs.js'
    }
  }
];
