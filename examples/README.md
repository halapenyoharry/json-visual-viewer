# Examples

Sample JSON files committed to the repo as reference / smoke-test fixtures for
the various views (Tree, Graph, Cytoscape, 3D Graph, Circles, Mass).

Loose `.json` files at the repo root are gitignored — drop sample data here
instead if you want it tracked. Anything outside `examples/` (and the few
required configs like `package.json`, `tsconfig*.json`) won't be picked up by
git.

## Available fixtures

### `myth-of-sisyphus.normalized-dyadic.json`

Knowledge graph extracted from Albert Camus's *The Myth of Sisyphus* (1942) —
philosophers, works, concepts, archetypes, and the dialectical movement from
the absurd through lucidity to revolt, freedom, and passion. **52 nodes, 82
links, 49 distinct predicate layers.**

Contributed by the
[information2topology](https://github.com/halapenyoharry/information2topology)
project. Public domain (1942 source text, generated extraction). Pipeline:

```
source text → InstaGraph extraction → TopoThink hypergraph → normalized-dyadic JSON
```

Shape is `{metadata, nodes, links}` with `kind` / `directed` / `role` /
`layer` / `attrs` annotations on each entity — the `NormalizedGraph`
contract JVV is converging on. JVV honors `id` / `label` / `source` /
`target` / `link.label` today; the remaining fields (`kind`, `directed`,
`role`, `attrs`, `layer`) land in v0.1.3.

Open it via **Open** in the toolbar (or drag-drop into the editor pane),
then switch to **3D Graph** for the best view of the dialectical web.
