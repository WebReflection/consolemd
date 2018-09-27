export default class HTMLReporter {
  constructor (context, opts) {
    opts = opts || {};
    this.context = context || document.body;
    this.allowHTML = opts.allowHTML;
  }
  init () {
    this.container = document.createElement('li');
  }
  report (text, styles) {
    if (styles) {
      var span = document.createElement('span');
      span.setAttribute('style', styles);
      span[this.allowHTML ? 'innerHTML' : 'textContent'] = text;
      this.container.append(span);
    } else {
      this.container.append(text);
    }
  }
  done (args) {
    // this.context.append(JSON.stringify(args));
    this.context.append(this.container);
  }
};
