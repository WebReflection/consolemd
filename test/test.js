import {default as consolemd, addReporter} from '../esm/index.js';

export default function (reporter) {
  if (reporter) {
    addReporter(reporter);
  }
  consolemd.log(':#green(*✓*): *OK*');
  consolemd.log(':#red(*x*): *FAIL*');
  consolemd.log('no formatting front only#yellow(*✓*)');
  consolemd.log('no formatting front#yellow(*✓*)no formatting back');
  consolemd.log('#yellow(*✓*)no formatting back only');
  consolemd.log('no formatting at all');
}
