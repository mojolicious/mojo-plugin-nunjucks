<p align="center">
  <a href="https://mojojs.org">
    <picture>
      <source srcset="https://github.com/mojolicious/mojo.js/blob/main/docs/images/logo-dark.png?raw=true" media="(prefers-color-scheme: dark)">
      <img src="https://github.com/mojolicious/mojo.js/blob/main/docs/images/logo.png?raw=true" style="margin: 0 auto;">
    </picture>
  </a>
</p>

[![](https://github.com/mojolicious/mojo-plugin-nunjucks/workflows/test/badge.svg)](https://github.com/mojolicious/mojo-plugin-nunjucks/actions)
[![Coverage Status](https://coveralls.io/repos/github/mojolicious/mojo-plugin-nunjucks/badge.svg?branch=main)](https://coveralls.io/github/mojolicious/mojo-plugin-nunjucks?branch=main)
[![npm](https://img.shields.io/npm/v/mojo-plugin-nunjucks.svg)](https://www.npmjs.com/package/mojo-plugin-nunjucks)

A mojo.js plugin that adds support for [nunjucks](https://www.npmjs.com/package/nunjucks) templates. The code of this
plugin is a good example for learning to build new plugins with [TypeScript](https://www.typescriptlang.org/), you're
welcome to fork it.

```js
import mojo from '@mojojs/core';
import nunjucksPlugin from 'mojo-plugin-nunjucks';

const app = mojo();
app.plugin(nunjucksPlugin);

// Render template "views/index.html.njk"
app.get('/template', async ctx => {
  await ctx.render({view: 'index'});
});

// Render an inline nunjucks template
app.get('/inline', async ctx => {
  await ctx.render({inline: '{{ greeting }} World!', engine: 'njk'}, {greeting: 'Hello'});
});

app.start();
```

To change the default engine for inline templates you can also set `app.renderer.defaultEngine` to `njk`. Or you can
register the template engine with a completely different name.

```js
app.plugin(nunjucksPlugin, {name: 'foo'});
app.renderer.defaultEngine = 'foo';
```

You can also extend the environment with custom filters and tags.

```js
app.renderer.engines.njk.env.addFilter('hello', name => {
  return `hello ${name}`;
});
```

## Installation

All you need is Node.js 16.0.0 (or newer).

```
$ npm install mojo-plugin-nunjucks
```
