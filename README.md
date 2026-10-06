# Dead Ahead — Guia de builds

Versão web da planilha de recomendações de itens e builds para os 52 personagens jogáveis de **Dead Ahead: Zombie Warfare**.

## Acessar o site

Após a publicação pelo GitHub Pages, o endereço será:

`https://storinoz.github.io/dead-ahead/`

## Conteúdo

- 52 personagens em ordem alfabética.
- 162 sprites exatos entre aparências principais e skins.
- Três árvores recomendadas por personagem.
- Atributos principais e secundários para Cup, Knife, Watch e Book.
- Sprites próprios de cada item, atualizados junto com a árvore selecionada.
- Observação específica para a árvore selecionada.
- Seletor visual de skins que altera o nome e o sprite no painel principal.
- Emblema do Team de cada skin, com balão dos bônus de 2, 3 e 5 unidades, acessível por mouse, teclado e toque.
- Busca por nome do personagem ou de qualquer skin, sempre abrindo a unidade principal.
- Interface integralmente em inglês, com classe, vantagens, balões explicativos e resumo de cada unidade.
- Perfil compacto à esquerda e informações da unidade/build à direita; itens em grade 2×2 (Cup, Watch / Knife, Book) e critérios em largura total. Layout empilhado no celular.
- Alternância entre os modos claro e escuro, com a preferência mantida nas próximas visitas.
- Busca rápida, navegação entre personagens e links compartilháveis.
- Planilha Excel original disponível pelo botão `Export .XLSX`.

## Estrutura

- `index.html`: estrutura da página.
- `styles.css`: aparência e layout responsivo.
- `app.js`: busca, seleção de builds e navegação.
- `data/personagens.json`: dados extraídos da planilha.
- `data/item-assets.json`: nomes, imagens e fontes dos itens dos 16 conjuntos.
- `data/unit-assets.json`: catálogo das aparências principais e skins dos 52 personagens.
- `data/unit-profiles.json`: classes, vantagens e resumos em inglês das unidades.
- `data/team-assets.json`: Teams, emblemas, bônus e afiliação de cada skin.
- `data/team-bonuses.json`: explicações revisadas dos bônus dos Teams.
- `assets/units`: sprites exatos dos personagens, organizados por unidade.
- `assets/classes` e `assets/perks`: escudos de classe e ícones de vantagens.
- `assets/teams`: 18 emblemas correspondentes aos Teams do jogo.
- `assets/items`: 64 sprites de itens organizados por conjunto e tipo.
- `assets/branding`: ícone e arte de cabeçalho do jogo.
- `scripts/sync-item-assets.mjs`: sincroniza os sprites a partir da wiki do jogo.
- `scripts/sync-unit-assets.mjs`: sincroniza personagens e skins a partir da wiki do jogo.
- `scripts/sync-unit-profiles.mjs`: sincroniza classes, vantagens e resumos das unidades.
- `scripts/sync-team-assets.mjs`: sincroniza emblemas e afiliações das skins e verifica as páginas dos Teams.
- `scripts/translate-builds-to-english.mjs`: padroniza os dados das builds em inglês.
- `downloads`: versão completa da planilha Excel.

## Atualização local

Abra um terminal nesta pasta e execute:

```powershell
git pull
```

Depois das alterações:

```powershell
git add .
git commit -m "Descreva a alteração"
git push
```

O GitHub Pages atualizará o site após o envio para a branch `main`.

## Nota

Projeto de fãs, sem vínculo oficial com os criadores do jogo. Personagens, skins e itens utilizam sprites correspondentes do jogo, com as fontes registradas nos catálogos de dados.
