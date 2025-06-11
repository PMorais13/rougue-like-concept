# Sistema de Upgrades

Este protótipo possui um sistema simples de evolução. Conforme o mago ganha
experiência e sobe de nível, você pode melhorar atributos gerais ou adicionar
"elementos" aos feitiços (Q, W e E).

## Como funciona

- **Ganho de XP**: ao derrotar inimigos, o jogador ganha XP. Quando atinge a
  quantidade necessária (`xpToNext`), sobe de nível.
- **Níveis comuns**: em níveis que não são múltiplos de 5, é sorteado um
  *upgrade* geral (estatística).
- **A cada 5 níveis**: aparece a tela para escolher um elemento (Fogo, Gelo ou
  Vento) e aplicar em um dos feitiços.

## Upgrades gerais

- **Faster attacks**: reduz o intervalo do disparo automático
  (`autoFireDelay`). O valor nunca fica abaixo de 5 quadros.
- **+1 Damage**: aumenta o dano básico de todas as magias (`baseDamage`).

## Elementos

Quando um feitiço possui um elemento, o efeito é aplicado toda vez que atinge um
inimigo:

- **Fire**: causa dano ao longo do tempo. Com um upgrade, provoca `0,5` de dano
  por segundo durante `3` segundos. Com dois upgrades, o dano passa para `1` por
  segundo durante `3` segundos. Com três upgrades, o inimigo sofre `2` de dano
  por segundo por `5` segundos. O efeito não acumula e os oponentes queimando
  piscam na tela.
- **Ice**: reduz a velocidade do alvo. Um upgrade diminui em `25%` por `1,5`
  segundo; dois upgrades diminuem em `50%` por `2` segundos; três upgrades
  imobilizam o alvo por `2` segundos.
- **Wind**: empurra o inimigo para trás. Com um upgrade o recuo é de `20` pixels;
  com dois, `40` pixels; com três, `80` pixels.

## Feitiços

### Q – Raio em linha reta

- Dá dano instantâneo a todos os inimigos na mesma altura do jogador.
- Cada upgrade de elemento aumenta a largura efetiva do raio.
- Os elementos selecionados para Q são aplicados a todos os inimigos
  atingidos.

### W – Barreira

- Cria uma barreira fixa logo à frente do mago.
- Cada upgrade de W concede 5 pontos de vida extra à barreira.
- Enemies que colidem com a barreira recebem os elementos aplicados a W.

### E – Torreta

- Conjura uma torreta que atira automaticamente em inimigos.
- É possível ter apenas uma torreta de cada vez.
- Cada upgrade de E aumenta o dano de seus projéteis.
- Os projéteis da torreta carregam os elementos adicionados a E.

## Observação sobre o elemento Vento

O recuo provocado por **Vento** varia conforme a quantidade de upgrades
adquiridos. Inimigos podem ser arremessados para longe (20, 40 ou 80 pixels),
o que torna o efeito perceptível mesmo contra adversários rápidos.

## Combinações Elementais

Nesta seção são listados nomes sugeridos para combinações de elementos. Eles podem servir como referência para efeitos visuais ou novas mecânicas no futuro.

### Combinações duplas

- **Fogo + Gelo → Vapor**
- **Fogo + Vento → Fogo Selvagem**
- **Gelo + Vento → Nevasca**
- **Fogo + Fogo → Chama Azul**
- **Gelo + Gelo → Geada Profunda**
- **Vento + Vento → Tornado**

### Combinações triplas

- **Fogo + Fogo + Fogo → Chama Branca**
- **Gelo + Gelo + Gelo → Era Glacial**
- **Vento + Vento + Vento → Ciclone**
- **Fogo + Fogo + Gelo → Vapor Escaldante**
- **Fogo + Fogo + Vento → Tempestade de Fogo**
- **Gelo + Gelo + Fogo → Gelo Candente**
- **Gelo + Gelo + Vento → Nevasca Congelante**
- **Vento + Vento + Fogo → Furacão Flamejante**
- **Vento + Vento + Gelo → Tempestade Gélida**
- **Fogo + Gelo + Vento → Tempestade Elemental**

