# Minecraft 26.x notes

Things learned while building this pack, checked against the 26.3 code, minecraft.wiki or
datapack.wiki.

## Formats

- Pack formats: data **121.0**, resource **97.1** (`min_format` / `max_format` arrays).
- Loot tables / predicates: conditions and functions use `"type"` (not `condition` / `function`);
  loot entries use `"modifier"` (list) and a single `"condition"` (use `minecraft:all_of`).
- Number providers need an explicit type: `{"type":"minecraft:uniform","min":1,"max":3}`.
  The old implicit `{min,max}` form makes the registry fail to load.
- Structure `spawn_overrides` counts can be int providers
  (`{"type":"minecraft:uniform","min_inclusive":1,"max_inclusive":2}`).

## Items

- Datapacks **can't add item types**. Custom items = an existing item + components.
- Recipe **ingredients only match item types or tags**, never components. So a custom
  crafting/smithing input needs a base item type nothing else uses. Good unused types:
  `debug_stick`, and game master blocks (`structure_block`, `jigsaw`, `command_block`…),
  which survival players can't place (`canUseGameMasterBlocks` = creative + op).
  `knowledge_book` is bad: using it consumes it.
- Item **tags are per item type**, so e.g. `#piglin_safe_armor` can't target one custom item.
  Re-basing on an item type already in the tag works (the crown is a `golden_helmet`).
- `smithing_transform`: `template` and `addition` are optional (minecraft.wiki; datapack.wiki
  lists them as required). The result copies the base's components (enchantments, trim,
  damage, name…), then applies the result's `components`, and the result can be a different
  item type (like diamond → netherite). The smithing table accepts any item that is some
  recipe's template ingredient.
- Smithing template tooltips ("Applies to / Ingredients") and the empty-slot ghost icons are
  hardcoded in `SmithingTemplateItem`; a custom template has to fake the tooltip with `lore`
  (vanilla keys `item.minecraft.smithing_template*` keep it localized).
- `smithing_trim` sets a single `trim` component: an item has **one trim**. The addition needs the
  `provides_trim_material` component.
- Ghost/utility components used: `!death_protection` (a totem that doesn't save you),
  `equippable` (`slot`, `asset_id`, `equip_sound`), `damage_resistant`, `repairable`,
  `enchantable`, `item_model`, `item_name`.

## Rendering (resource pack)

- Equipment assets `assets/<ns>/equipment/<id>.json`: `layers` per layer type (`humanoid`,
  `humanoid_leggings`, `humanoid_baby`, `horse_body`…). Multiple layers stack in order;
  `dyeable` layers take the dye colour. `trim_overrides` swap the trim palette per material
  (e.g. netherite trim on netherite armor uses `trim/netherite_darker`). Trims render on top.
- Layer textures: `textures/entity/equipment/<layer type>/<texture>.png`.
- Trim textures: `textures/trims/entity/<layer type>/<pattern asset>.png`. With a
  `.png.mcmeta` `{"palette":{"base_palette":"trim_base"}}` only the exact key colours are
  recoloured to the material; other colours pass through. Without it, the texture is used as is.
- Item model definitions (`assets/<ns>/items/*.json`) support `minecraft:composite` (layer several
  models, e.g. a vanilla helmet's trim `select` tree + an overlay) and `minecraft:empty`.
- Custom atlas sources: add a `directory` source to `atlases/blocks.json` to use entity-style
  textures in item/block models.
- `item_display` + custom item models is the way to build custom mob models: set
  `interpolation_duration` / `teleport_duration` for smooth animation.

## Entities and AI

- **Blindness has no effect on mobs** (minecraft.wiki); only players are affected.
  Invisibility does reduce how far mobs detect you.
- Retargeting a mob: `damage <mob> 0.01 minecraft:generic by <entity>` sets its last attacker,
  and the `HurtByTargetGoal` switches the target to it. Doesn't work while the mob is
  hurt-invulnerable (≈10 ticks after taking damage; smaller damage is ignored) or in its first tick.
- **Mannequin** (`minecraft:mannequin`, added in 1.21.9): player-model NPC with no AI, takes
  damage, can wear armor and hold items. `profile` sets the skin (`{name,id,properties}`); copying
  a `player_head`'s `profile` component works. Mobs ignore mannequins unless provoked.
- Piglins stay neutral if **any armor slot** holds an item in `#piglin_safe_armor`
  (`PiglinAi.isWearingSafeArmor`, the ARMOR slot group, which includes `body`). The player's
  `armor.body` slot exists, but only accepts items whose `equippable.slot` is
  `body`.
- `execute on target` / `on attacker` / `on passengers` are the easy way to walk entity links.
- **`@e` never matches dying entities** (Health 0, during the 20-tick death animation), so a
  `Health ≤ 0` check run from `execute as @e[...]` never fires. `execute on vehicle` (and `@s`)
  still reach them: tick a mob through a passenger (e.g. a `marker`, which also rides fine and
  doesn't change the mob's AI) to catch its death.
- Wandering traders: `wander_target` (int array `[I;x,y,z]`) makes the WanderToPositionGoal walk
  there (speed ×0.35, in legs of up to 10 blocks). `DespawnDelay:0` means it never despawns.
  Base speed is 0.7.
- A mob's home (`home_pos` + `home_radius`, radius ≥ 0 to be read) also limits targeting:
  `TargetGoal.canAttack` rejects targets outside it. A home far below the mob (radius 1) blocks all
  vanilla targeting while strolling and fleeing still work (they only respect a home within their range).
- Mobs stop random strolling after 100 ticks of `noActionTime`, which counts up every tick and is reset
  by being hurt or by a player within 32 blocks (monster category): on an empty test server nothing strolls.
- Evokers (illager renderer) draw held items only while casting; villager-like mobs draw theirs in the
  crossed-arms layer.
- `data` edits to a villager reload its brain (`readAdditionalSaveData` calls `refreshBrain`).
- Players can't be `data modify`'d (e.g. `TicksFrozen`): imitate the effect with effects, damage
  and scores.
- `damage <target> <amount> <type> by <direct entity> from <cause>` credits the cause (hurt-by
  retaliation, kill credit); the direct entity can be anything, e.g. an `item_display`.
- Test servers: dedicated servers pause when empty (`pause-when-empty-seconds`), and entities in
  chunks without a player nearby don't tick unless `forceload`ed (their `HurtTime` never goes
  down, so they stay invulnerable).
- Small fireballs: summon, then set `Motion` (direction × speed) and `Owner` (the shooter's UUID)
  so hits are credited to the shooter.
- Structure placement processors from mods don't exist in datapacks. Emulate them with marker
  entities in the structure NBT plus a setup function.
