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

- **Fire**: aplica queimadura por 60 quadros. A cada 20 quadros o inimigo sofre
  1 de dano extra.
- **Ice**: deixa o inimigo lento por 60 quadros, reduzindo sua velocidade pela
  metade.
- **Wind**: empurra o inimigo 20 pixels para a direita (para longe do jogador).
  Se o inimigo estiver rápido, o recuo pode parecer pequeno.

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

O código empurra o inimigo 20 pixels para a direita sempre que o elemento
Vento é aplicado. Como os inimigos se movem constantemente para a esquerda,
esse recuo pode ser discreto. Para um efeito mais visível, seria preciso
ajustar esse valor ou aplicar a força de forma repetida.

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

