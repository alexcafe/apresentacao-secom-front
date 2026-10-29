# Do Joomla ao WordPress — apresentação Secom/UnB

Hotsite de cenas com rolagem para a apresentação de 3 horas sobre WordPress, Gutenberg e Elementor.
28 cenas em 5 capítulos: Fundamentos, Conteúdo, Gutenberg, Elementor e Migração. O tom é de contexto
(onde estamos e para onde vamos), não de convencimento.

## No dia da apresentação

Abra `dist/index.html` com duplo clique (Chrome ou Edge). Funciona sem internet e sem servidor.
Copie a pasta `dist/` inteira (o HTML usa `dist/prints/`).

| Tecla | Ação |
| --- | --- |
| → ↓ PageDown Espaço Enter | próxima parada (funciona com passador de slides) |
| ← ↑ PageUp Backspace | parada anterior |
| Home / End | início / fim |
| F11 | tela cheia do navegador |

A rolagem do mouse também funciona livremente. A cena "Respiro", no fim do capítulo Conteúdo,
resume o que já foi visto e abre espaço para perguntas antes dos editores.

## Desenvolvimento

```bash
nvm use            # Node 24 LTS (.nvmrc)
npm install
npm run dev        # http://localhost:5180
npm run build      # gera dist/ (JS, CSS e fontes embutidos no index.html)
```

- `index.html` — marcação e textos de todas as cenas (atributos `data-*` explicados no topo de `<main>`).
- `src/main.js` — motor: Lenis + ScrollTrigger, paradas do teclado, contador, trilho, ondas.
- `src/scenes/*.js` — um módulo por tipo de cena (`tour`, `cards`, `mutavel`, `roteiro`...).
- `src/fx/` — esfera de partículas, formas orgânicas do fundo e fio condutor.
- `src/styles/` — tokens (cores UnB), base e estilos das cenas.

Para mudar o foco de um passo do tour, ajuste `data-x`/`data-y` (em % do print), `data-z` (zoom)
e `data-img` (índice do print) no `<li>` correspondente.

## Prints

- `npm run prints:joomla` — dobra inicial dos 4 sites Joomla (públicos).
- `npm run prints:wp` — telas do painel, Gutenberg e Elementor no site `cafeteste` (homologação),
  logado como o Editor temporário `secom-apresentacao`. Precisa da VPN da UnB e do `.env.local`
  (senha e segredo do 2FA por aplicativo; nunca versionar). Aceita nomes de prints específicos.
- `scripts/criar-conteudo.mjs` criou o conteúdo de demonstração (IDs em `scripts/_ids.json`).

### Limpeza depois da apresentação

No `cafeteste`, remover o usuário `secom-apresentacao` (ID 10) e o conteúdo de demonstração:
post 28818, página 28819, categoria 22, tags 23–25 e o menu 26.
Backup anterior às mudanças: `/opt/backups/<host>/20261027/cafeteste/*230648*`.
