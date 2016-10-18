(function () {
  for (var
    parse = typeof process === 'object' ?
      (function (echomd) {
        return function () {
          return [echomd.apply(echomd, arguments)];
        };
      }(require('echomd').raw)) :
      (function (join) {
        return function () {
          var
            txt = join.call(arguments, ' '),
            out = []
          ;
          txt = txt.replace(
            /(\*{1,2})(?=\S)(.*?)(\S)\1/g,
            function ($0, $1, $2, $3) {
              out.unshift('font-weight:bold;', 'font-weight:inheirt;');
              return '%c' + $2 + $3 + '%c';
            }
          );
          txt = txt.replace(
            /(_{1,2})(?=\S)(.*?)(\S)\1/g,
            function ($0, $1, $2, $3) {
              out.unshift('text-decoration:underline;', 'text-decoration:inheirt;');
              return '%c' + $2 + $3 + '%c';
            }
          );
          txt = txt.replace(
            /(~{1,2})(?=\S)(.*?)(\S)\1/g,
            function ($0, $1, $2, $3) {
              out.unshift('text-decoration:line-through;', 'text-decoration:inheirt;');
              return '%c' + $2 + $3 + '%c';
            }
          );
          out.unshift(txt);
          return out;
        };
      }([].join))
    ,
    overwrite = function (method) {
      var original = console[method];
      console[method] = function () {
        return original.apply(
          console,
          parse.apply(null, arguments)
        );
      };
    },
    methods = ['error', 'info', 'log', 'warn'],
    i = 0; i < methods.length; i++
  ) {
    overwrite(methods[i]);
  }
}());