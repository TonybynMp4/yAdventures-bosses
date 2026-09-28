# yAdventures-bosses docs

Personal-use datapack + resource pack for Minecraft Java **26.3** (data pack format 121.0,
resource pack format 97.1) with three bosses (Iceologer, Illusioner, Wildfire), their structures and items, all in the
`yadventures-bosses` namespace (except the small interface for the yAdventures heart pack, see
[mechanics.md](mechanics.md)).

Personal use only: it includes content derived from the Myriad datapack (the Iceologer's model rig
and leg animation) and the Friends & Foes mod (textures, sounds, models and behaviour), so don't
publish it.

| Doc | What's in it |
|---|---|
| [content.md](content.md) | What the pack adds: mobs, structures, items, recipes, loot, admin functions |
| [mechanics.md](mechanics.md) | How each feature is implemented (functions, tags, scoreboards) |
| [scripts.md](scripts.md) | The Sandstone build, its inputs, and the test-server workflow |
| [minecraft-notes.md](minecraft-notes.md) | Engine facts learned along the way (26.x formats, AI, rendering, gotchas) |

The functions, items, recipes, item definitions and most models are **generated** by Sandstone from `src/`
(`npm run build`, output in `.sandstone/output/`). Structures, worldgen, chest loot, textures and sounds are
hand-maintained in `resources/` (see [scripts.md](scripts.md)).
