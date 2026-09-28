# Content

## Mobs

| Mob | Base entity | Where |
|---|---|---|
| Iceologer | invisible `wandering_trader` tagged `yadventures-bosses.iceologer`, wearing item models | Iceologer Cabin (snowy biomes) |
| Illusioner | vanilla `illusioner` with custom behaviour | Illusioner Shack, Illusioner Training Grounds (taigas) |
| Wildfire | `blaze` scaled ×1.5625, invisible, wearing item-display models | Citadel (Nether) |

Bosses only come from the trial spawner in their structure (no natural spawning). See
[Trial spawners](#trial-spawners-keys-and-vaults).

The Iceologer follows the Friends & Foes one: 36 HP, keeps its distance from players, and alternates
three spells (see [mechanics.md](mechanics.md)):

- **Ice chunk** (every 8 s): a chunk of ice grows above the target, follows it for 3–5 s, then
  falls: 12 magic damage and freezing to everything under it (except illagers). Under a low roof it
  hovers lower.
- **Slowness** (every 11 s): freezes the target as if it had been in powder snow.
- **Strays** (every 24 s, only while at most 1 of its strays is alive): 3–4 strays appear within 10 blocks,
  each with an iron axe or a bow.

It drops 10 XP when killed by a player.

## Structures (`yadventures-bosses:worldgen/structure/*`)

| Structure | Biomes | Spacing / separation |
|---|---|---|
| `yadventures-bosses:iceologer_cabin` | snowy taiga, grove, snowy slopes, snowy plains | 56 / 14, 4 chunks away from villages |
| `yadventures-bosses:illusioner_shack`, `illusioner_training_grounds` | `#is_taiga` | one set (`illusioner_lairs`, weight 1 each): 40 / 10, 4 chunks away from villages |
| `yadventures-bosses:citadel` | `#is_nether` | 32 / 10, 8 chunks away from nether complexes |

For comparison, vanilla uses: igloo and desert pyramid 32 / 8, trial chambers 34 / 12,
woodland mansion 80 / 20, and nether complexes 27 / 4.

Chest/barrel loot tables: `yadventures-bosses:chests/*`, `yadventures-bosses:barrels/*`.

### Explorer maps

`loot_table/maps/<citadel|iceologer|illusioner>` gives a `filled_map` pointing to the nearest lair
that isn't already on a map (vanilla `exploration_map`, 50-chunk search). If none is in range,
no map drops. The map icons are the unused vanilla marker types, retextured:
- Citadel: `target_x`;
- Iceologer: `target_point`;
- Illusioner: `blue_marker`.

Each map has its own item texture. Where to get them:

| Map | Chest | Chance |
|---|---|---|
| Citadel | bastion treasure / other bastion chests | 50% / 10% |
| Illusioner | woodland mansion chests | 10% |
| Iceologer | snowy cartographer trade (see below) | — |

The chest maps come from overridden vanilla tables, each with one pool added.

**Iceologer map trade:** `villager_trade/cartographer/emerald_and_compass_iceologer_map`, added
to `#minecraft:cartographer/level_3`. It is limited to snowy villagers (`merchant_predicate`) and
costs 13 emeralds + a compass (like the monument map), 100-chunk search. A journeyman cartographer
offers 2 of its level's eligible trades, so about half of snowy cartographers sell it.

## Trial spawners, keys and vaults

Each boss lair has a trial spawner and two vaults. Killing the boss ejects a key:
"<Boss> Key", or "Ominous <Boss> Key" from an ominous spawner. It is a trial key that only opens
that boss's vault of the same kind. Each vault rewards each player once. Bad Omen makes the spawner
ominous and spawns a stronger boss (see [mechanics.md](mechanics.md)).

Each player can start each spawner once per difficulty (normal, ominous). While only players who have
already won the difficulty they'd start are near, the spawner is locked (it looks like an ominous spawner
in cooldown).

Trial spawners and vaults are in `#minecraft:mineable/pickaxe` (vanilla ones too) but slow on
purpose: a survival player aiming at one with a pickaxe gets `block_break_speed` ×0.147
(`mining/tick`, a 0.1-block raycast up to the interaction range). About 15 s with a diamond
Efficiency V pickaxe and 64 s with a plain diamond one. They drop nothing.

Boss health (×1.5 when ominous, ×0.5 easy, ×1.5 hard): Iceologer 36, Illusioner 48,
Wildfire 180 on normal. See [mechanics.md](mechanics.md).

Vault loot (`loot_table/spawner/<boss>/{vault,ominous_vault}`):
- normal vault: the boss's signature item + 1 rare roll + 2–4 common rolls;
- ominous vault: the signature item + 1 ominous roll + 1 rare roll + 3–5 common rolls.

Signature items: Totem of Freezing (Iceologer), Totem of Illusion (Illusioner), 3–5 Wildfire Crown
Fragments (Wildfire). The bosses themselves only drop minor items.

The pools per boss are in `VAULT_LOOT` in `src/spawners.ts`. They hold enchanted books and gear,
potions, crown templates, netherite scrap, etc.

## Items

All custom items are vanilla items with components; they're identified by
`custom_data.yadventures-bosses`. Give them with `function yadventures-bosses:give/<name>`.

| Item | Base item | Source | Effect |
|---|---|---|---|
| Totem of Freezing | `totem_of_undying` (no `death_protection`) | Iceologer vaults (one in each) | Held in either hand: when you're hurt by an entity and drop to ≤ half health, it's consumed. Mobs within 9 blocks are frozen (powder-snow freeze, 20 s) and get Slowness II 20 s; other players get Slowness II; you get Speed II 10 s |
| Totem of Illusion | `totem_of_undying` (no `death_protection`) | Illusioner vaults (one in each) | Same trigger. You teleport to a random point of a ring of 9, the 8 others get mannequin copies of you (skin, armor, held items) for 30 s. Mobs that were targeting you are made to attack a copy. You get Invisibility 10 s |
| Wildfire Crown Fragment | `debug_stick` | Wildfire vaults (3–5 in each) | Crafting material |
| Wildfire Crown Upgrade (Smithing Template) | `structure_block` | Crafted | Smithing template for the crown |
| Wildfire Crown | `golden_helmet` (see below) | Smithing | Netherite helmet stats + fire resistance while not burning + piglins stay neutral |

Boss drops:
- Illusioner: 0–1 emerald (player kill, + looting), 0–2 arrows (+ looting)
- Iceologer: 0–1 emerald (player kill, + looting), 0–2 blue ice (+ looting)
- Wildfire: 0–2 blaze powder (+ looting)

## Recipes

- **Wildfire Crown Upgrade**: shaped `CCC` / `CSC`, C = Crown Fragment, S = Netherite Scrap.
- **Template duplication**: shaped `GTG` / `GBG` / `GGG`, T = template, G = gold ingot,
  B = blaze rod → 2 templates (mirrors the netherite template duplication).
- **Wildfire Crown** (smithing): template + **netherite helmet** + gold block. Keeps the
  helmet's enchantments, trim, damage, name and repair cost (smithing copies components).

Because recipe ingredients only match item types (see
[minecraft-notes.md](minecraft-notes.md)), *any* debug stick counts as a fragment and *any*
structure block counts as a template. Both are unobtainable in survival otherwise.

## Wildfire Crown details

The crowned helmet is a **`golden_helmet`** under the hood so it's natively in
`#minecraft:piglin_safe_armor`. Components make it behave like a netherite helmet:

- `attribute_modifiers`: armor 3, toughness 3, knockback resistance 0.1 (id `minecraft:armor.helmet`)
- `max_damage` 407, `enchantable` 15, `repairable` `#repairs_netherite_armor`,
  `damage_resistant` `#is_fire` (floats in lava)
- `equippable` asset `yadventures-bosses:wildfire_crown_netherite` (netherite layer + crown layer; netherite's
  darker trim palette kept), `item_model` `yadventures-bosses:wildfire_crown_netherite_helmet` (vanilla netherite
  helmet model incl. trim variants + crown overlay), `item_name` "Wildfire Crown"
- `custom_data {yadventures-bosses:{crown:1b}}` (used by `yadventures-bosses:wearing_wildfire_crown`)

Side effects of being a golden helmet: it can be smelted into a gold nugget, and piglins pick
it up if it's dropped (`#piglin_loved`).

## Admin functions

- `function yadventures-bosses:give/<item>`: totems, fragment, template, `<boss>_map` (needs a lair within range)
- `function yadventures-bosses:commands/summon/<boss>` and `commands/summon/ominous_<boss>`
  (`wildfire`, `iceologer`, `illusioner`): not leashed, no key.
- `function yadventures-bosses:commands/give/<boss>_trial_blocks`: that boss's trial spawner, vault and
  ominous vault as items, to place by hand (creative + operator). A spawner without a setup marker
  registers itself when it first spawns its boss.
- A plain `/summon minecraft:illusioner` still gets the Illusioner's copy behaviour.
