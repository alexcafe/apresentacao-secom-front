// Conteúdo-demo da Secom no cafeteste (criado pelo usuário temporário via REST).
// Os IDs vão para scripts/_ids.json, usados pela captura e pela limpeza.
import { writeFileSync, existsSync, readFileSync } from 'node:fs';
import { abrir, rest } from './_wp.mjs';

const ARQ = new URL('./_ids.json', import.meta.url);
if (existsSync(ARQ)) {
  console.log('conteúdo já criado:', readFileSync(ARQ, 'utf8'));
  process.exit(0);
}

const { browser, page } = await abrir({ escala: 1 });
const ids = {};
const ok = (r, o) => {
  if (r.status >= 300) throw new Error(`${o}: ${r.status} ${JSON.stringify(r.json).slice(0, 300)}`);
  return r.json;
};

ids.categoria = ok(await rest(page, 'POST', '/wp/v2/categories', { name: 'Secom', description: 'Conteúdo-demo da apresentação' }), 'categoria').id;
ids.tags = [];
for (const nome of ['WordPress', 'Migração', 'Comunicação']) {
  ids.tags.push(ok(await rest(page, 'POST', '/wp/v2/tags', { name: nome }), 'tag').id);
}

const img = (id, url, alt) =>
  `<!-- wp:image {"id":${id},"sizeSlug":"large","linkDestination":"none","className":"is-style-rounded"} -->
<figure class="wp-block-image size-large"><img src="${url}" alt="${alt}" class="wp-image-${id}"/><figcaption class="wp-element-caption">${alt}</figcaption></figure>
<!-- /wp:image -->`;

const midia = ok(await rest(page, 'GET', '/wp/v2/media/2912?_fields=source_url'), 'mídia');

const post = ok(
  await rest(page, 'POST', '/wp/v2/posts', {
    title: 'Secom inicia o planejamento da migração dos portais para WordPress',
    excerpt: 'Equipe conhece a plataforma, os editores Gutenberg e Elementor e traça o roteiro da mudança.',
    status: 'publish',
    categories: [ids.categoria, 10],
    tags: ids.tags,
    featured_media: 2911,
    content: `<!-- wp:paragraph {"fontSize":"medium"} -->
<p class="has-medium-font-size">A Secretaria de Comunicação começou a preparar a mudança dos portais da UnB, hoje em Joomla, para o WordPress.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2 class="wp-block-heading">Por que mudar</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Mais autonomia para quem publica, padrão visual único entre os sites e um ecossistema enorme de recursos mantidos pela comunidade.</p>
<!-- /wp:paragraph -->

${img(2912, midia.source_url, 'Entrada do subsolo do ICC')}

<!-- wp:list -->
<ul class="wp-block-list"><!-- wp:list-item -->
<li>Inventário dos conteúdos atuais</li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li>Kit visual comum no Elementor</li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li>Migração e redirecionamentos</li>
<!-- /wp:list-item --></ul>
<!-- /wp:list -->

<!-- wp:quote -->
<blockquote class="wp-block-quote"><!-- wp:paragraph -->
<p>Publicar deve ser tão simples quanto escrever um e-mail.</p>
<!-- /wp:paragraph --><cite>Equipe Secom</cite></blockquote>
<!-- /wp:quote -->

<!-- wp:buttons -->
<div class="wp-block-buttons"><!-- wp:button -->
<div class="wp-block-button"><a class="wp-block-button__link wp-element-button">Conheça o roteiro</a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons -->`,
  }),
  'post',
);
ids.post = post.id;

const pagina = ok(
  await rest(page, 'POST', '/wp/v2/pages', {
    title: 'Guia de publicação Secom',
    status: 'publish',
    parent: 673,
    content: `<!-- wp:heading {"level":2} -->
<h2 class="wp-block-heading">Como publicar no novo portal</h2>
<!-- /wp:heading -->

<!-- wp:columns -->
<div class="wp-block-columns"><!-- wp:column -->
<div class="wp-block-column"><!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading">Posts</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Notícias, editais e avisos: têm data, categoria e tags.</p>
<!-- /wp:paragraph --></div>
<!-- /wp:column -->

<!-- wp:column -->
<div class="wp-block-column"><!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading">Páginas</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Conteúdo institucional e permanente, organizado em hierarquia.</p>
<!-- /wp:paragraph --></div>
<!-- /wp:column --></div>
<!-- /wp:columns -->`,
  }),
  'página',
);
ids.pagina = pagina.id;

const menu = ok(await rest(page, 'POST', '/wp/v2/menus', { name: 'Menu Secom (demo)' }), 'menu');
ids.menu = menu.id;
const itens = [
  { title: 'Início', type: 'custom', url: '/' },
  { title: 'Notícias', type: 'taxonomy', object: 'category', object_id: 10 },
  { title: 'Quem somos', type: 'post_type', object: 'page', object_id: 673 },
  { title: 'Contato', type: 'post_type', object: 'page', object_id: 642 },
];
const criados = [];
for (const [i, it] of itens.entries()) {
  criados.push(ok(await rest(page, 'POST', '/wp/v2/menu-items', { ...it, menus: menu.id, status: 'publish', menu_order: i + 1 }), 'item').id);
}
ok(
  await rest(page, 'POST', '/wp/v2/menu-items', {
    title: 'Guia de publicação',
    type: 'post_type',
    object: 'page',
    object_id: pagina.id,
    parent: criados[2],
    menus: menu.id,
    status: 'publish',
    menu_order: 4,
  }),
  'subitem',
);

writeFileSync(ARQ, JSON.stringify(ids, null, 2));
console.log('criado:', JSON.stringify(ids));
await browser.close();
