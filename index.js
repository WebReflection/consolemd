(function (info) {
  for (var
    line = Array(33).join('─'),
    // just using same name used in echomd, not actual md5
    md5Base64 = function (txt) {
      for (var out = [], i = 0; i < txt.length; i++) {
        out[i] = txt.charCodeAt(i).toString(32);
      }
      return out.join('').slice(0, txt.length);
    },
    getSource = function (hash, code) {
      for (var source in code) {
        if (code[source] === hash) {
          return source;
        }
      }
    },
    commonReplacer = function ($0, $1, $2, $3) {
      return '%c' + $2 + $3 + '%c';
    },
    match = function (txt, what, stack) {
      var info = transform[what], i, match;
      while (match = info.re.exec(txt)) {
        i = match.index;
        if (!stack[i]) stack[i] = [];
        stack[i].push({
          k: 'start',
          v: typeof info.start === 'string' ?
            info.start : info.start(match)
        });
        i = i + match[0].length;
        if (!stack[i]) stack[i] = [];
        stack[i].unshift({
          k: 'end',
          v: typeof info.end === 'string' ?
            info.end : info.end(match)
        });
      }
    },
    replace = function (txt, what) {
      var info = transform[what];
      return txt.replace(info.re, info.place);
    },
    transform = {
      bold: {
        re: /(\*{1,2})(?=\S)(.*?)(\S)\1/g,
        place: commonReplacer,
        start: 'font-weight:bold;',
        end: 'font-weight:inherit;'
      },
      header1: {
        re: /^(\#[ \t]+)(.+?)[ \t]*\#*([\r\n]+|$)/gm,
        place: commonReplacer,
        start: 'font-weight:bold;font-size:1.6em;',
        end: 'font-weight:inherit;font-size:inherit;'
      },
      header2: {
        re: /^(\#{2,6}[ \t]+)(.+?)[ \t]*\#*([\r\n]+|$)/gm,
        place: commonReplacer,
        start: 'font-weight:bold;font-size:1.3em;',
        end: 'font-weight:inherit;font-size:inherit;'
      },
      underline: {
        re: /(_{1,2})(?=\S)(.*?)(\S)\1/g,
        place: commonReplacer,
        start: 'border-bottom:1px solid;',
        end: 'border-bottom:inherit;'
      },
      strike: {
        re: /(~{1,2})(?=\S)(.*?)(\S)\1/g,
        place: commonReplacer,
        start: 'text-decoration:line-through;',
        end: 'text-decoration:inherit;'
      },
      multiLineCode: {
        re: /(^|[^\\])(`{2,})([\s\S]+?)\2(?!`)/g,
        start: 'font-family:monospace;',
        end: 'font-family:initial;'
      },
      singleLineCode: {
        re: /(^|[^\\])(`)(.+?)\2/gm,
        start: 'font-family:monospace;',
        end: 'font-family:initial;'
      },
      color: {
        re: /(!?)#([a-zA-Z0-9]{3,8})\((.+?)\)(?!\))/g,
        place: function ($0, bg, rgb, txt) {
          return '%c' + txt + '%c';
        },
        start: function (match) {
          return (match[1] ? 'background-' : '') + 'color:' +
                 (/^[a-fA-F0-9]{3,8}$/.test(match[2]) ? '#' : '') +
                 match[2] + ';';
        },
        end: function (match) {
          return (match[1] ? 'background-' : '') + 'color:initial;';
        }
      }
    },
    parse = typeof process === 'object' ?
      (function (echomd) {
        return function () {
          return [echomd.apply(echomd, arguments)];
        };
      }(require('echomd').raw)) :
      (function (join) {
        return function () {
          var
            code = (Object.create || Object)(null),
            multiLineCode = transform.multiLineCode.re,
            singleLineCode = transform.singleLineCode.re,
            storeAndHide = function ($0, $1, $2, $3) {
              $3 = $3.replace(/%c/g, '%%c');
              return $1 + $2 + (code[$3] = md5Base64($3)) + $2;
            },
            restoreHidden = function ($0, $1, $2, $3) {
              return $1 + '%c' + getSource($3, code) + '%c';
            },
            txt = join.call(arguments, ' '),
            out = [],
            args, i, j, length, css, key
          ;

          match(txt, 'multiLineCode', out);
          txt = txt.replace(multiLineCode, storeAndHide);
          match(txt, 'singleLineCode', out);
          txt = txt.replace(singleLineCode, storeAndHide);

          match(txt, 'header2', out);
          match(txt, 'header1', out);

          match(txt, 'bold', out);
          match(txt, 'underline', out);
          match(txt, 'strike', out);

          match(txt, 'color', out);

          // transform
          txt = txt.replace(/^[ ]{0,2}([ ]?[*_-][ ]?){3,}[ \t]*$/gm, line);

          txt = replace(txt, 'header2');
          txt = replace(txt, 'header1');

          txt = replace(txt, 'bold');
          txt = replace(txt, 'underline');
          txt = replace(txt, 'strike');

          txt = txt.replace(/^([ \t]{2,})[*+-]([ \t]{1,})/gm, '$1•$2');

          txt = txt.replace(/^[ \t]*>([ \t]?)/gm, function ($0, $1) {
            return Array($1.length + 1).join('▌') + $1;
          });

          txt = replace(txt, 'color');

          // cleanup duplicates
          txt = txt.replace(/(?:%c([ \t]*))+/g, '%c$1');

          // put back code
          txt = txt.replace(singleLineCode, restoreHidden);
          txt = txt.replace(multiLineCode, restoreHidden);

          args = [txt];
          length = out.length;
          for (i = 0; i < length; i++) {
            css = '';
            key = '';
            for (j = i; j < length; j++) {
              i = j;
              if (j in out) {
                out[j].sort(endFirst);
                // TODO: this is an Array of values.
                if (!key || (key === out[j].k)) {
                  key = out[j].k;
                  css += out[j].v;
                } else {
                  break;
                }
              }
            }
            if (css) args.push(css);
          }
          return args;
        };
      }([].join))
    ,
    overwrite = function (method) {
      var original = console[method];
      if (!original.raw) (console[method] = function () {
        return original.apply(console, parse.apply(null, arguments));
      }).raw = function () {
        return original.apply(console, arguments);
      };
    },
    methods = ['error', 'info', 'log', 'warn'],
    i = 0; i < methods.length; i++
  ) {
    overwrite(methods[i]);
  }
}());

// console.log('a ~*_bold_*~ #green(*b*) lol');