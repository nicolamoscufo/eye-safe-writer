# Study callouts / Callout per lo studio

Select **Study** under **Style Settings → Eye Safe Writer → Activity Presets** if you want more room for reading. The callouts below work with any preset, using native Obsidian Markdown.

## Appunti di esempio — probabilità

> [!definizione] Definizione — valore atteso
> Il valore atteso di una variabile casuale discreta è la media dei suoi valori, pesati per le rispettive probabilità.

> [!formula] Formula — valore atteso discreto
> $$\mathbb{E}[X] = \sum_x x\,P(X=x)$$
>
> Per una variabile di Bernoulli con parametro $p$, si ottiene $\mathbb{E}[X] = p$.

> [!esempio] Esempio — lancio di una moneta
> Sia $X=1$ per testa e $X=0$ per croce. Se la moneta è equa, il valore atteso è $0.5$.
>
> | Valore | Probabilità | Contributo |
> | --- | --- | --- |
> | $0$ | $0.5$ | $0$ |
> | $1$ | $0.5$ | $0.5$ |

> [!esercizio]- Esercizio — prova tu
> Una variabile assume i valori $2$ e $6$ con probabilità $0.25$ e $0.75$. Calcola il valore atteso.
>
> > [!esempio]- Soluzione — apri dopo aver provato
> > $2\cdot 0.25 + 6\cdot 0.75 = 5$.

> [!dubbio] Dubbio — da chiarire
> Il valore atteso deve essere uno dei valori possibili della variabile? Confronta la definizione con l'esempio della moneta.

## English names

> [!definition] Definition — probability distribution
> A probability distribution assigns probabilities to possible outcomes.

> [!formula] Formula — normalization
> $$\sum_x P(X=x) = 1$$

> [!example] Example — a fair die
> Each face has probability $1/6$.

> [!exercise]+ Exercise — check the total
> Sum the probabilities of the six faces. This exercise starts expanded and can be folded.

> [!doubt] Question — assumption to check
> Would the same distribution describe a loaded die?

## Usage

- Keep the callout type lowercase; add your own title after `[!type]`.
- Use `[!exercise]-` to start collapsed or `[!exercise]+` to start expanded.
- Formula rendering and folding are provided by Obsidian, not by a plugin bundled with the theme.
- The theme supplies native icons and palette-aware styling; it never changes your note content.
