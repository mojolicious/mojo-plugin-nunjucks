import nunjucksPlugin from '../lib/nunjucks.js';
import mojo from '@mojojs/core';
import Path from '@mojojs/path';
import t from 'tap';

t.test('nunjucksPlugin', async t => {
  const app = mojo({mode: 'testing'});
  app.plugin(nunjucksPlugin);
  app.plugin(nunjucksPlugin, {name: 'foo'});

  app.renderer.viewPaths.push(Path.currentFile().sibling('support', 'views').toString());

  app.get('/', async ctx => {
    await ctx.render({view: 'test'}, {name: 'World'});
  });

  app.get('/inline', async ctx => {
    await ctx.render({inline: '{{ greeting }} World!', engine: 'njk'}, {greeting: 'Hello'});
  });

  app.get('/child', async ctx => {
    await ctx.render({view: 'child', engine: 'njk'});
  });

  const ua = await app.newTestUserAgent({tap: t});

  await t.test('Plain template', async () => {
    (await ua.getOk('/')).statusIs(200).bodyLike(/Hello World/);
  });

  await t.test('Inline template', async () => {
    (await ua.getOk('/inline')).statusIs(200).bodyLike(/Hello World/);
  });

  await t.test('Template inheritance', async () => {
    (await ua.getOk('/child'))
      .statusIs(200)
      .bodyLike(/default content.+This is the left side!.+This is the right side!/s);
  });

  await ua.stop();
});
