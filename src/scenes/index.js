import hero from './hero.js';
import polaroids from './polaroids.js';
import mutavel from './mutavel.js';
import tour from './tour.js';
import cards from './cards.js';
import numeros from './numeros.js';
import dicionario from './dicionario.js';
import split from './split.js';
import lego from './lego.js';
import vitrine from './vitrine.js';
import comparativo from './comparativo.js';
import roteiro from './roteiro.js';
import tema from './tema.js';
import respiro from './respiro.js';
import modelo from './modelo.js';
import componentes from './componentes.js';
import final from './final.js';

// data-scene="nome" → fábrica(secao, ctx) que devolve { timeline?, onProgress?, onStep? }
export const cenas = { hero, polaroids, mutavel, tour, cards, numeros, dicionario, split, lego, vitrine, comparativo, roteiro, final, tema, respiro, modelo, componentes };
