import type {MojoApp, MojoContext, MojoRenderOptions} from '@mojojs/core';
import {createHash} from 'node:crypto';
import Path from '@mojojs/path';
import LRU from 'lru-cache';
import nunjucks from 'nunjucks';

/**
 * Adds nunjucks template support to mojo.js.
 */
export default function nunjucksPlugin(app: MojoApp, options: {name?: string} = {}) {
  const name = options.name ?? 'njk';
  app.renderer.addEngine(name, new NunjucksEngine(app));
}

class NunjucksEngine {
  cache: LRU<string, any>;
  env: any;

  constructor(app: MojoApp) {
    this.cache = new LRU({max: 100});
    this.env = new nunjucks.Environment(new NunjucksLoader(app));
  }

  async render(ctx: MojoContext, options: MojoRenderOptions) {
    let template;

    if (options.inline !== undefined) {
      const checksum = createHash('md5').update(options.inline).digest('hex');
      template = this.cache.get(checksum);

      if (template === undefined) {
        template = nunjucks.compile(options.inline, this.env);
        this.cache.set(checksum, template);
      }
    } else {
      template = this.cache.get(options.viewPath);

      if (template === undefined) {
        if (options.viewPath === undefined) throw new Error('viewPath is not defined for nunjucksEngine');
        const source = await new Path(options.viewPath).readFile('utf8');
        template = nunjucks.compile(source.toString(), this.env);
        this.cache.set(options.viewPath, template);
      }
    }

    return Buffer.from(template.render({...ctx.stash, stash: ctx.stash, ctx, view: options}));
  }
}

class NunjucksLoader {
  app: MojoApp;

  constructor(app: MojoApp) {
    this.app = app;
  }

  getSource(name: string): {src: string; path: string; noCache: boolean} {
    const suggestion = this.app.renderer.findView({view: name});
    if (suggestion === null) return {src: '', path: 'unknown', noCache: true};
    const path = suggestion.path;
    return {src: new Path(path).readFileSync().toString(), path, noCache: false};
  }
}
