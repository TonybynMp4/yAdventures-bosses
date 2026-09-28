# yAdventures-bosses

Datapack + resource pack for Minecraft Java 26.3 (data pack format 121, resource pack format 97),
built with Sandstone: sources in `src/`, hand-maintained files in `resources/`, vanilla files in
`vendor/`. `bun run build` writes both packs to `.sandstone/output/`.

Personal use only: it contains content ported from Friends & Foes, so don't publish it.

## Sources of information

Use these as the references for Minecraft and datapack/resource pack work, and check them
before relying on memory — data-driven mechanics change a lot between versions:

- [datapack.wiki](https://datapack.wiki) — datapack/resource pack guides and concepts
  (commands, functions, recipes, custom items, worldgen, breaking changes between versions).
- [minecraft.wiki](https://minecraft.wiki) — game mechanics and exact file formats
  (e.g. [Data component format](https://minecraft.wiki/w/Data_component_format),
  [Recipe](https://minecraft.wiki/w/Recipe_(Java_Edition)), entity and item pages).

When the two disagree or are vague, prefer minecraft.wiki for exact formats, and confirm
against the game itself (a test server, or the decompiled 26.3 jar) when it matters.
