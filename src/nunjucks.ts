import type {MojoApp, MojoContext} from '@mojojs/core';
import {createHash} from 'node:crypto';
import Path from '@mojojs/path';
import LRU from 'lru-cache';
import nunjucks from 'nunjucks';

interface RenderOptions {
  engine?: string;
  format?: string;
  inline?: string;
  inlineLayout?: string;
  json?: any;
  layout?: string;
  maybe?: boolean;
  pretty?: boolean;
  status?: number;
  text?: string;
  variant?: string;
  view?: string;
  yaml?: any;
  [key: string]: any;
}

/**
 * Adds nunjucks template support to mojo.js.
 */
export default function nunjucksPlugin(app: MojoApp, options: {name?: string} = {}) {
  const name = options.name ?? 'njk';
  app.renderer.addEngine(name, new NunjucksEngine());
}

class NunjucksEngine {
  cache: LRU<string, any>;

  constructor() {
    this.cache = new LRU({max: 100});
  }

  async render(ctx: MojoContext, options: RenderOptions) {
    let template;

    if (options.inline !== undefined) {
      const checksum = createHash('md5').update(options.inline).digest('hex');
      template = this.cache.get(checksum);

      if (template === undefined) {
        template = nunjucks.compile(options.inline);
        this.cache.set(checksum, template);
      }
    } else {
      template = this.cache.get(options.viewPath);

      if (template === undefined) {
        if (options.viewPath === undefined) throw new Error('viewPath is not defined for nunjucksEngine');
        const source = await new Path(options.viewPath).readFile('utf8');
        template = nunjucks.compile(source.toString());
        this.cache.set(options.viewPath, template);
      }
    }

    return Buffer.from(template.render({...ctx.stash, stash: ctx.stash, ctx, view: options}));
  }
}
