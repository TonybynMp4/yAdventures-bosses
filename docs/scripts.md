# Build and scripts

The packs are built with [Sandstone](https://sandstone.dev) (TypeScript, run by Bun):

```sh
bun install
bun run build     # or: bun run watch; bun run typecheck
```

Bun (version pinned by `packageManager` in `package.json`) is required: the `sand` CLI runs on it.

The output goes to `.sandstone/output/{datapack,resourcepack}` (gitignored; nothing built is committed).
Only Sandstone's written files and `resources/` end up in it, so dropped or renamed resources disappear
on the next build. If the output looks incomplete after deleting it, delete `.sandstone/` as a whole:
`cache.json` makes Sandstone skip files it thinks are unchanged.

| Path | Holds |
|---|---|
| `src/` | The generator: items/loot/recipes/predicates/tags/advancement, all functions, the load/tick function tags, and the resource pack's item definitions, generated models (items, Wildfire, ice chunk), equipment asset, atlas, lang and `sounds.json`. One module per area (`core`, `illusioner`, `iceologer`, `totems`, `wildfire`, `spawners`, `maps`, `resourcepack`); `index.ts` imports them all. Functions are written as raw command text (`fn()` in `lib.ts`). |
| `resources/{datapack,resourcepack}/` | Hand-maintained files, copied into the output as is (see below). |
| `vendor/` | Vanilla 26.3 files that generated resources build on (see below). |
| `scripts/load-test.sh` | Boots a 26.3 server (downloaded, SHA-1 checked) on a fresh seed-12345 world with the built datapack, summons all six bosses (normal + ominous), lets them tick for 10 s, checks 2 of each are alive, runs `/reload`, and fails on any error, warning or command error in the log. Needs Java 25: `scripts/load-test.sh [workdir]` (default `/tmp/yab-ci`; `PACK=<dir>` to test another build). |
| `.github/workflows/build.yml` | CI on every push/PR, three jobs: `typecheck` (`bun run typecheck`), `build` (uploads the datapack and resource pack as artifacts, each a ready-to-use zip), `load-test` (runs `load-test.sh` on the built datapack and uploads the server log). |
| `.github/workflows/release.yml` | On a `v*` tag push (or run by hand with a tag name): typecheck, build, `load-test.sh`, then a GitHub release with `yAdventures-bosses-{datapack,resourcepack}-<tag>.zip`. The notes come from `.github/release-notes.md` (personal-use warning, install steps) plus the generated changelog. |
| `.github/dependabot.yml` | Weekly grouped updates for the Bun packages and GitHub Actions. |
| `scripts/rcon.py` | Tiny RCON client for the test server: `python3 scripts/rcon.py 'cmd 1' 'cmd 2' ...` (127.0.0.1:25575, password `x`). |

## Hand-maintained files

Everything in `resources/` is edited directly:

- **Ported once** (the porting script is gone): structures
  (`yadventures-bosses/structure`), worldgen (`yadventures-bosses/worldgen`, biome tags), chest/barrel loot, the textures
  (items, Wildfire, crown layer, Illusioner retexture, Iceologer, ice chunk) and the sounds with
  their sound files (`src/resourcepack.ts` writes `sounds.json`).
- **Iceologer model files** (`yadventures-bosses/models/iceologer/`): the rig and leg animation, textured
  with the Friends & Foes texture. `template/*` hold the geometry; the `normal`/`hurt` variants only set textures. The
  leg textures under `textures/yadventures-bosses_entity/iceologer/legs/` are animated (`.mcmeta`).
  During the port, structure entities became setup markers (see [mechanics.md](mechanics.md))
  and loot was converted to 26.x syntax (see [minecraft-notes.md](minecraft-notes.md)).
  Later hand edits: `illusioner_shack/entity/illusioner.nbt` holds a `spawn_illusioner` marker,
  the Iceologer marker has Rotation `[0,0]`, and every structure has empty `spawn_overrides`.
- **Vendored vanilla files** (`vendor/`): besides the netherite helmet assets, the 26.3 loot tables
  `chests/bastion_treasure`, `bastion_other` and `woodland_mansion`.
  `src/maps.ts` writes them to `data/minecraft/loot_table/` with an explorer map pool added. Re-vendor
  them when updating Minecraft, since they replace the vanilla tables. Another pack that overrides
  the same tables will conflict.
- **Map icons**: `minecraft/textures/map/decorations/{target_x,target_point,blue_marker}.png` and
  `yadventures-bosses/textures/item/<boss>_map.png`. They are recolored vanilla trial chambers,
  snowy village and woodland mansion icons, on the explorer map parchment.
- **Hand-made textures**: `yadventures-bosses/textures/item/wildfire_crown_upgrade_smithing_template.png`
  and `yadventures-bosses/textures/item/wildfire_crown_overlay.png` (layered over the vanilla netherite
  helmet icon), both drawn from existing textures.

## Test server workflow

```sh
# server.properties: enable-rcon=true, rcon.password=x (rcon.port 25575)
cp -r .sandstone/output/datapack <server>/world/datapacks/yadv
java -Xmx3G -jar server.jar nogui > log.txt 2>&1 &
grep -i "error\|couldn't\|failed" log.txt     # datapack load errors show up here
python3 scripts/rcon.py 'reload' 'function yadventures-bosses:commands/summon/wildfire'
python3 scripts/rcon.py stop
```

Tips:
- Stop the server with RCON `stop`; `pkill -f server.jar` also kills the shell that started it.
- Freshly summoned mobs ignore being hurt in their first tick (the hurt-by goal compares the
  hurt timestamp with 0). Wait a tick before testing retaliation.
- Servers pause when empty (`pause-when-empty-seconds`, default 60): set it to 0, and
  `forceload` the test area, or entities outside it won't tick.
- Anything needing a player (totems, crown, piglins, visuals) can't be tested headless.
  Mannequins can stand in for equipment/predicate checks.
- Server jar (needs Java 25):
  `https://piston-data.mojang.com/v1/objects/33680f5f2ac32864d6d7cf5e56a705fdb3e05f4c/server.jar`,
  client jar: `https://piston-data.mojang.com/v1/objects/e877b6a07acd633fb3bb475002175cec036e7b87/client.jar`.
- Decompiling: 26.x jars are unobfuscated. Extract classes and run CFR
  (`java -jar cfr.jar path/To.class`) to read the exact game logic.

## Editing structures

The structure `.nbt` files aren't generated, so they can be edited in game:

1. Use a creative world with cheats and the pack installed. Run
   `function yadventures-bosses:commands/give/<boss>_trial_blocks` first, then
   `datapack disable "file/<pack>"`. With the pack enabled, the setup markers inside loaded
   structures (citadel pillars, shack brewing stand) would run and delete themselves.
2. Get a structure block (`give @s structure_block`) and switch it to Load. Enter the structure
   name (below) and click Load twice (the first click only shows the bounding box).
3. Edit it. To move the boss's trial blocks, replace the boss jigsaw (below) with its final block
   and place the given spawner and vaults where you want them. Vaults face you when placed. The
   spawner needs open space within its spawn range (Iceologer 2, Illusioner 3, Wildfire 4 blocks,
   same y ±1) and line of sight from the spawn spot to the spawner.
4. Switch the structure block to Save, keep the same name and size, turn **Include entities** on,
   and click Save. The file is written to `<world>/generated/yadventures-bosses/structure/<name>.nbt`,
   and it overrides the datapack's copy in that world. Copy it over the file in
   `resources/datapack/data/yadventures-bosses/structure/`.

| Structure | Size | Boss jigsaw (relative pos → final block) |
|---|---|---|
| `yadventures-bosses:iceologer_cabin/cabin/cabin` | 10×8×9 | [4,0,4] → brown_wool |
| `yadventures-bosses:illusioner_shack/shack/shack` | 11×10×15 | [5,1,10] → spruce_planks |
| `yadventures-bosses:illusioner_training_grounds/illusioner_training_grounds` | 13×4×13 | [5,0,6] → cobblestone |
| `yadventures-bosses:citadel/citadel` | 31×33×31 | [15,8,15] → red_nether_bricks |

Leave the other jigsaws (goats, wolf, wither skeletons) alone. A kept boss jigsaw still attaches
the setup marker, which places a second spawner and vaults.
