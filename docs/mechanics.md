# Mechanics

Entry points: `#minecraft:load` → `yadventures-bosses:load` (scoreboards, team, storage);
`#minecraft:tick` → `yadventures-bosses:tick`; `yadventures-bosses:second` reschedules itself every second.

Dying entities (Health 0, playing the death animation) aren't matched by `@e`, so a boss's
`Health ≤ 0` check would never run. Both bosses are therefore ticked **through a passenger**
(`execute as <passenger> on vehicle`), which still reaches the dying vehicle.

## Structure mobs and setup

Structures contain setup markers that a function turns into the real thing:

- Boss trial blocks (spawner, vault, ominous vault) are placed in the structure files themselves
  (positions in [scripts.md](scripts.md#editing-structures)). The older boss spawn-point **markers**
  (`yadventures-bosses.setup` + `yadventures-bosses.spawn_wildfire` / `spawn_iceologer` /
  `spawn_illusioner`, from the `<structure>/entity/<boss>` pools) still work but no structure uses
  them now: `yadventures-bosses:spawner/setup/<boss>` turns one into a boss trial spawner plus vaults (see below).
- Brewing stands get a `yadventures-bosses.setup_brewing_stand` marker; `yadventures-bosses:setup/brewing_stand` fills them
  with random potions (night vision or invisibility).
- Cabin armor stands are tagged `yadventures-bosses.cabin_armor_stand`; `yadventures-bosses:setup/armor_stand` gives a leather
  helmet plus each other leather piece with a 1/3 chance.
- Citadel: each foundation column ends in a `yadventures-bosses.citadel_pillar` marker.
  `yadventures-bosses:setup/pillar` extends it down with nether bricks through
  `#yadventures-bosses:citadel_pillar_replaceable` (air/fluids) until it reaches ground.

`yadventures-bosses:tick` runs `yadventures-bosses:setup/run` at every `yadventures-bosses.setup` marker, which then kills itself.

**Structure spawns:** every structure has empty `spawn_overrides`: no pillagers or blazes spawn
around them over time. The only boss source is the trial spawner.

## Trial spawners (`yadventures-bosses:spawner/*`, `yadventures-bosses:convert/*`)

A spawn-point marker gets a `trial_spawner` **on the floor** (marker y − 1; the marker sits 2 above the floor).
A spawner sunk into the floor fails its spawn line-of-sight check almost every time. Next to it
are two vaults, normal and ominous, in a row. The row follows the marker yaw when both spots are
free (`vaults_x` / `vaults_z`) and the vaults face the side with open space.

- Configs are `trial_spawner/<boss>/{normal,ominous}.json`: 1 mob total, 1 at a time, range 2–4,
  player range 14 (vanilla). The spawned mob carries `yadventures-bosses.convert[.<boss>]` (+ `ominous`,
  `from_spawner`) tags. The Wildfire and Iceologer also spawn silent and invisible, so their
  vanilla form never shows.
- `yadventures-bosses:tick` runs `convert/run` on those mobs. It applies the boss setup (the same
  as `commands/summon/*`), scales max health (below), sets health to max, and for spawner mobs
  stores the home position (`spawner/set_home`).
- Every boss gets diamond boots with Protection IV and Feather Falling IV (drop chance 0). None of their
  renderers draw armor, so they're invisible: 3 armor, −16 % damage, −64 % fall damage.
- **Health scaling** (max_health modifiers, applied once at conversion): `yadventures-bosses:ominous`
  +0.5 (×1.5) when ominous, then `yadventures-bosses:difficulty` −0.5 on easy / +0.5 on hard
  (`add_multiplied_total`).

  | Boss | Base | Easy | Normal | Hard | Ominous easy / normal / hard |
  |---|---|---|---|---|---|
  | Iceologer | 36 | 18 | 36 | 54 | 27 / 54 / 81 |
  | Illusioner | 48 | 24 | 48 | 72 | 36 / 72 / 108 |
  | Wildfire | 180 | 90 | 180 | 270 | 135 / 270 / 405 |
- **Leash:** every second, a `leashed` boss that is more than 32 blocks from home is teleported
  back (passengers follow).
- **Keys:** on the kill, the spawner ejects `loot_table spawner/<boss>/{,ominous_}key`. That is a
  `(ominous_)trial_key` with `item_name`, `lore` and `custom_data {yadventures-bosses:{key,ominous}}`.
  The vault's `key_item` is generated identically, so a vanilla trial key doesn't fit and the other
  bosses' keys don't either. Each vault pays out once per player (vanilla).
- **Ominous:** Bad Omen → Trial Omen near the spawner, as in vanilla. The ominous config spawns a
  buffed boss:
  - All: ×1.5 health (above).
  - Wildfire: attack 10, 2–3.5 s between attacks.
  - Iceologer: cooldowns 5/7 s.
  - Illusioner: copy cooldown 300.
  Ominous item dispensers are disabled (`spawner/nothing`).
- Cooldown: 1 minute (`target_cooldown_length` 1200, `SPAWNER_COOLDOWN`), set by the setup and when
  the spawner registers. The lock below is what stops repeats.
- **Once per player per difficulty** (`spawner/tick`, every tick):
  - When a spawner first spawns its boss, `convert/run` → `spawner/find` searches the 9×3×9 box
    around the boss (nearest first) for the `trial_spawner` and `spawner/register` puts a
    `yadventures-bosses.spawner` marker in it with a new `yadventures-bosses.id`. Spawners placed by
    hand work too; the marker dies when the block is gone.
  - In `waiting_for_reward_ejection`, survival/adventure players within 48 get
    `yadventures-bosses.beat.<id>.normal` or `.ominous` (from the block's `ominous` state).
  - *Eligible* player: survival/adventure within 20, without the tag for the difficulty they'd start
    (ominous if they have Bad Omen or Trial Omen, predicate `has_omen`).
  - Lock (only in `inactive`, `waiting_for_players` or `cooldown`): no eligible player, and some
    survival/adventure player within 20. It's set to `cooldown` + `ominous=true` with
    `cooldown_ends_at` 9e18. An ominous spawner in cooldown skips player detection entirely, and
    `setblock` of the same block keeps the block entity. The marker gets `yadventures-bosses.locked`.
  - Unlock: an eligible player within 20, or no survival/adventure player within 32. It's set to
    `cooldown` + `ominous=false` with `cooldown_ends_at` 0, so on its next tick vanilla resets it to
    `waiting_for_players`.
  - Side effect: a locked spawner looks like an ominous one in cooldown.
- Trial spawner configs are a dynamic registry: config changes need a server restart, and only
  newly generated structures get spawners.

## Iceologer (`yadventures-bosses:iceologer/*`, `yadventures-bosses:ice_chunk/*`)

Port of the Friends & Foes Iceologer.

**Entity:** an invisible, `Silent` `wandering_trader` tagged `yadventures-bosses.iceologer`: 36 HP, follow
range 18, no trades, `DespawnDelay:0` (never despawns), team `yadventures-bosses.illagers`, loot
`yadventures-bosses:entities/iceologer`. Its body, an `item_display` passenger
(`yadventures-bosses.iceologer_body`), drives its tick (see above) and is killed once it has no vehicle.
Older versions used a `marker` passenger (`yadventures-bosses.iceologer_link`) and wore the body in their
hands: `iceologer/link` empties the hands, adds the body and kills the marker.

**Model:** the head slot holds `yadventures-bosses:iceologer/head` (the custom head layer renders it). The
body passenger displays `yadventures-bosses:iceologer/body` (`item_display:"ground"`), with a transformation
that reproduces the villager crossed-arms item layer from the passenger seat 1.95 blocks up; its yaw follows the
trader's `Rotation[0]` every tick (the trader's body rotation isn't readable, so it lags behind when it
turns in place). Variants come from `custom_model_data` flags:

| Item | flags |
|---|---|
| head | `[hurt]` |
| body | `[hurt, moving, spellcasting]` |

- *hurt*: while `HurtTime` > 0, and during the death animation.
- *moving*: `yadventures-bosses:moving` predicate (horizontal speed, not riding).
  The walking legs are all 9 rotations of each leg layered, and their animated textures show one
  at a time.
- *spellcasting*: while casting.

The flags are kept as a bit set in `yadventures-bosses.flags`, and the items are only modified when it changes.

The wandering trader's own goals stay active. It panics when hurt, and avoids zombies and
illagers (the team stops those from attacking it). In daylight it tries to drink milk because
it's invisible (at night it would drink an invisibility potion, but it's already invisible). That goal
(`UseItemGoal`, priority 0, no flags) can't be blocked, and it holds the milk in the mainhand, which
is why the body isn't a held item. Taking the milk away stops the drinking (`updatingUsingItem` needs the
same item), and the goal restarts it with fresh milk every other tick. Instead, `iceologer/tick` modifies the
milk in place (`MILK_DISGUISE`): it gets the `yadventures-bosses:empty` item model (draws nothing) and loses
its `consumable` component. It's still a milk bucket, so the drinking continues and finishing does nothing.
Every 32 ticks the drink finishes and the goal restarts it with a fresh milk bucket, which `startUsingItem`
sends to clients right away, a tick before `iceologer/tick` can disguise it. So the resource pack draws
`milk_bucket` held by any wandering trader (`context_entity_type`) as nothing too.
`yadventures-bosses:iceologer/second` still re-applies invisibility, just in case.

**Every second** (`yadventures-bosses:iceologer/second`):
- Removed on Peaceful. Ambient sound (17% chance).
- Flee: with a survival/adventure player within 8 blocks, it gets a +100 % speed modifier
  (`yadventures-bosses:flee`) and its `wander_target` is set 10 blocks away from the player (the trader's
  WanderToPositionGoal walks there). Otherwise both are removed.
- Target: dropped if gone, over 18 blocks away, or a creative/spectator player. With no target, it
  picks the nearest player within 16 blocks in line of sight, else the nearest iron golem,
  villager, wandering trader or glow squid. Line of sight is a 0.5-block raycast
  (`yadventures-bosses:util/raycast`) through `#yadventures-bosses:see_through`. When hurt, it targets the attacker
  (unless it's an illager or a creative player).
- Casts a spell when it has a target and a spell is off cooldown (strays first, then ice chunk, then slowness;
  slowness instead of a second ice chunk in a row when both are ready).

**Targets** are stored as ids: `yadventures-bosses:util/uid` gives the target a permanent
`yadventures-bosses.uid`, and the Iceologer (or ice chunk) keeps it in `yadventures-bosses.target`.
`yadventures-bosses:util/tag_target` tags the matching entity `yadventures-bosses.target` for the current function.

**Spells** (`yadventures-bosses:iceologer/cast/*`, `yadventures-bosses.state` 1 = ice chunk, 2 = slowness, 3 = strays):
- Start: prepare sound, spellcasting arms, movement speed ×0 (`yadventures-bosses:casting`) and cooldown
  (ice chunk 8 s, slowness 11 s, strays 24 s from the start of the cast; ominous 5/7/16 s). Strays start
  on a 10 s cooldown and are only cast while at most 1 of its strays (same `yadventures-bosses.id`) is alive.
- While casting: faces the target, and spell particles at both hands (`entity_effect`,
  ice chunk (0.4, 0.3, 0.35), slowness (0.1, 0.1, 0.2)).
- Tick 20: cast sound and the spell. The pose ends at tick 30 (ice chunk) or 20 (slowness, strays).
- Strays (`iceologer/strays/*`): 3–4 (ominous 4) `stray`s, spread with `spreadplayers` within 10 blocks
  (ground below the Iceologer's y + 3; if that fails they stay at the Iceologer). Tagged
  `yadventures-bosses.iceologer_stray`, on the `illagers` team (their arrows don't hurt it), holding an iron
  axe or a bow (50/50, default drop chance), and wearing an
  icy leather helmet (drop chance 0) so they don't burn in daylight. Vanilla stray loot.
- Particle colours: strays (0.7, 0.85, 0.95).
- Slowness: a burst of snowflakes and snowball particles with powder-snow and freeze-hurt sounds on the target.
  Mobs get `TicksFrozen` 400 (powder snow freezing). Players get Slowness III for 7 s; they can't be
  data-modified, so `yadventures-bosses:iceologer/freeze_player` imitates the freezing: unless they wear
  `#minecraft:freeze_immune_wearables`, `yadventures-bosses.frozen` is set to 130 ticks (how long 400 frozen
  ticks stay "fully frozen" while thawing), with snowflakes and 1 `freeze` damage every 40 ticks.

**Ice chunk** (`item_display` tagged `yadventures-bosses.ice_chunk`, model `yadventures-bosses:ice_chunk`):
- Spawns above the target at its height squared, capped at 6 (players 3.24, villagers 3.8,
  iron golems 6, glow squid 0.64; `yadventures-bosses.offset`). It grows from scale 0 over 30 ticks.
- Headroom (`ice_chunk/headroom`, on spawn and every follow tick): the height is lowered so the 1-block
  chunk fits under whatever is above the target (`#yadventures-bosses:ice_chunk_passable`, checked every
  0.25 blocks from 1 block up). Otherwise it sat in a low ceiling and landed on the roof.
- Sounds: summon at age 10, ambient at age 40.
- Follows the point above the target at 0.2 blocks/tick for 60–100 ticks (`yadventures-bosses.timer`).
  It's removed if the target becomes creative/spectator, and falls early if the target is gone.
- Falls: speed +0.05 blocks/tick every tick (max 2), moved in 0.05 steps until the block below
  isn't `#yadventures-bosses:ice_chunk_passable`.
- Lands: hit sound and blue ice particles. Everything living in its 2.9×1×2.9 box (except
  illagers, Iceologers and armor stands) takes 12 `indirect_magic` damage from the owner
  Iceologer (`magic` if the owner is dead) and is frozen like the slowness spell.
- Killed at age 400 as a safety net.

**Death** (`Health ≤ 0`, seen through the passenger): tag `yadventures-bosses.dead`, death sound, hurt
tint, and a 10-XP orb when a player killed it. The body falls over like a vanilla mob (tilted by
min(1, sqrt((DeathTime − 1) / 20 × 1.6)) × 90°): three interpolated transformation keyframes (45°, 75°, 90°),
timed by `yadventures-bosses.timer` (`iceologer/dying`).

Every tick, `#yadventures-bosses:prevent_aggression` mobs without a team join `yadventures-bosses.illagers`
(friendly fire off). Mobs on the same team never target each other or avoid each other (`TargetingConditions`
checks `isAlliedTo`), so zombies and illagers don't attack the Iceologer and it doesn't run from them.
A mob on no team targets it in the first second after spawning, which is why this runs every tick.

## Ring of copies (`yadventures-bosses:util/*`, shared)

Used by both the Illusioner and the Totem of Illusion. `#mode yadventures-bosses.dummy`: 0 = illusioner,
1 = player.

1. `start_ring`: new id (`#next yadventures-bosses.id` → caster's `yadventures-bosses.id` and `#id`), random teleport index
   `#tp` in 1..9 and random ring yaw.
2. `ring_points`: 9 points 40° apart, 9 blocks out (`^ ^ ^9`).
3. `ring_point`: finds ground within 16 blocks down, then up: two `#yadventures-bosses:passable` blocks over a
   non-passable, non-fluid block.
4. `ring_action`: point `#tp` teleports the caster there, the others spawn a copy.

`yadventures-bosses:util/vanish` = poof particles + tp to y −1000 + kill (no death animation/drops).

## Illusioner (`yadventures-bosses:illusioner/*`)

Replaces the vanilla mirror/invisibility spell with real illusions:

- Clears vanilla long invisibility (`yadventures-bosses:long_invisibility`, > 60 ticks) every tick.
- Vanilla blindness spell (20 s, cast once per new target by every illusioner, copies included): when its target
  has blindness > 60 ticks (`yadventures-bosses:long_blindness`), a copy clears it and the real one
  swaps it for 8 s of Darkness (blindness fog is a fixed ~5-block wall).
- When hurt (`HurtTime:10s`) by a non-illager, non-creative attacker and `yadventures-bosses.cooldown` is 0:
  mirror sound, 3 s invisibility, ring of **8 real `illusioner` copies**. Cooldown 600 ticks.
- The same happens (same cooldown) whenever its target is a survival/adventure player within 24 blocks, so a fight
  opens with illusions instead of waiting for the first hit.
- The real Illusioner holds a Power IV bow.
- Copies (`yadventures-bosses.illusion`): hold a bow, copy the owner's Health and Rotation, empty loot
  (`yadventures-bosses:entities/empty`), zero drop chances, same `yadventures-bosses.id` as the owner.
- A copy vanishes when hit, after 600 ticks (`yadventures-bosses.timer`), or when no real illusioner with the
  same id is within 64 blocks.
- Escape (`illusioner/escape/*`): while on cooldown, 2 hits within 3 s (`yadventures-bosses.hits`,
  `hit_window` 60 ticks) or 8+ damage in that window (`hit_damage`, from `health` = last tick's Health×100) make it
  swap places with a random copy of its own within 32 blocks (mirror sound, clouds, 1 s invisibility). With
  no copies left it teleports to a random point of the 9-block ring instead (`#mode` 2 = teleport only).

## Totems (`yadventures-bosses:totem/*`)

Trigger: advancement `yadventures-bosses:technical/totem_hurt` (`entity_hurt_player` with `custom_data {yadventures-bosses:{kind:"totem"}}`
in either hand and a `source_entity` on the damage) → `yadventures-bosses:totem/hurt` revokes it, checks health is > 0 and
≤ max/2 (`Health×100` vs `max_health×50`), then uses the mainhand totem first, else the offhand.
`yadventures-bosses:totem/use` (macro) consumes one (`yadventures-bosses:consume` item modifier), plays the totem sound and
particles, then runs `yadventures-bosses:totem/<kind>`.

### Totem of Illusion copies

- Copies are **`minecraft:mannequin`** (player-shaped NPC, no AI), tagged `yadventures-bosses.player_illusion`.
- Skin: the player's head is generated with loot table `yadventures-bosses:technical/player_head`
  (`fill_player_head`), and its `profile` component is copied to the mannequin's `profile`.
- Armor and both hands are copied with `item replace ... from entity`.
- Random yaw via `rotate` macro; `yadventures-bosses.timer` 600; vanish when hit or timed out.
- **Distraction:** blindness does nothing to mobs, so instead every mob that was targeting the
  player (`execute on target`) is tagged `yadventures-bosses.distract` and remembers the ring id in
  `yadventures-bosses.decoy`. 11 ticks later (`schedule ... 11t`, after hurt-invulnerability ends)
  `yadventures-bosses:totem/distract` deals 0.01 damage to it **`by`** a random copy with that id. Mobs with
  a "retaliate when hurt" goal (most hostiles) switch target to the mannequin, walk over, hit it,
  and it vanishes. Tested with husk and skeleton. Brain-AI mobs (piglins, wardens…) may not
  react the same way.

## Wildfire (`yadventures-bosses:wildfire/*`)

- Entity: `blaze` tagged `yadventures-bosses.wildfire`, scale 1.5625, 180 HP, 8 attack damage (ominous 10), follow range 32,
  speed 0.23, knockback resistance 1, persistent, permanent invisibility, `Silent`, loot `yadventures-bosses:entities/wildfire`.
- Model: two `item_display` passengers with `item_model` `yadventures-bosses:wildfire/body` and
  `yadventures-bosses:wildfire/shields_<n>` (n = shields left, `shields_0` is `minecraft:empty`). The tick runs
  through the body display (`on vehicle`). Displays without a vehicle are killed each tick.
- The body display turns to face the target each tick (`rotate @s ~ 0`); passengers don't
  inherit the blaze's yaw.
- Shields spin 45° every second (`yadventures-bosses:wildfire/spin`, rotation from storage
  `yadventures-bosses:data shield_rotation`, `interpolation_duration` 20).
- **Shields:** while `yadventures-bosses.shields` > 0, any health loss is undone and added to `yadventures-bosses.absorbed`
  (hundredths of HP). At `yadventures-bosses.shield_hp` (max health × 25, i.e. a quarter of max
  health: 4500 at 180 HP; set in `convert/run` after the health scaling) a shield breaks: sound, particles, attacker takes 8
  damage. A shield regenerates after 300 ticks without being hurt, up to 4.
- **AI** (`yadventures-bosses.state`: 0 idle, 1 barrage, 2 shockwave, 3 charge), using the blaze's own target.
  One attack at a time: when an attack ends (`wildfire/attack_end`), `yadventures-bosses.attack_cd`
  is set to 60–100 ticks (ominous 40–70). It counts down while there is a target, then
  `wildfire/next_attack` picks one (random 1..5): 1–2 barrage; 3–4 shockwave if the target is
  within 6, else charge if within 20, else barrage; 5 summon if none of its blazes are alive, else as 3–4. First attack 1 s
  after spawning.
  - Shockwave: 20-tick windup (body display moves down then slams), then a blast on the ground below
    it (first non-passable block, up to 8 blocks down): 16 damage to everything within 7 of that point
    except `#yadventures-bosses:wildfire_allies` and the model; ring of flame particles and explosions.
  - Charge: 15-tick windup (flame particles, low blaze sound), then the direction to the target's
    eyes is locked (`charge_x/y/z`, ×1000) and Motion is set to 1.2 blocks/tick along it for up
    to 15 ticks. The first tick anything living (except allies) is within 2.2 of its center, all of
    them take 20 damage and the charge stops. It always ends in a shockwave where it stopped.
  - Summon blazes: 1–2 blazes tagged `yadventures-bosses.wildfire_blaze` with the same
    `yadventures-bosses.id`.
  - Barrage: a volley of 8 small fireballs every 11 ticks until 32 are fired, aimed with a
    spread (marker at `^ ^ ^1`, Motion = offset × 0.1, `Owner` = wildfire); an 8-damage melee
    hit on every other volley if the target is within 3. Stops early if the target is lost.
- **Wander** (`wildfire/wander/*`, `yadventures-bosses.wander`, `wander_x/z`): while idle (state 0, with or
  without a target) it drifts 20–40 ticks in a random horizontal direction at 0.1 blocks/tick (Motion, since
  the vanilla `BlazeAttackGoal` holds the move flag in combat), then pauses 30–80 ticks (40 after spawning).
  A leashed (spawner) Wildfire more than 6 blocks from its home heads home instead.
- The vanilla blaze attack still runs. Small fireballs owned by a Wildfire without the
  `yadventures-bosses.debris` tag (its own volleys have it) are killed each tick.
- Death (health ≤ 0): tag `yadventures-bosses.dead`, sound and particles, passengers killed.

## Wildfire Crown (`yadventures-bosses:crown/*`)

`yadventures-bosses:second` runs `yadventures-bosses:crown/wearer` for players matching `yadventures-bosses:wearing_wildfire_crown`
(`custom_data {yadventures-bosses:{crown:1b}}` in `armor.head`): Fire Resistance 8 s unless already burning
(`yadventures-bosses:burning`: on fire or in lava). Piglin safety is not code: the crown is a
golden helmet (see [content.md](content.md)).

## yAdventures heart pack interface

The only things in the `yadventures` namespace, used by the yAdventures datapack to detect this pack
and award hearts:
- `yadventures:compat/bosses_loaded` (hand-maintained, just `return 1`), listed in its
  `#yadventures:compat/bosses` tag.
- Entity tags `yadventures.boss.iceologer` and `yadventures.boss.wildfire` on the bosses, and
  `yadventures.boss.illusion` on the Illusioner's illusions (so killing them doesn't count).

## Scoreboards / storage

| Objective | Used for |
|---|---|
| `yadventures-bosses.dummy` | temporaries and constants (`#2`, `#8`, `#20`, `#180`) |
| `yadventures-bosses.id` | links illusioner ↔ copies, player ↔ mannequins, wildfire ↔ its blazes (`#next` = counter) |
| `yadventures-bosses.timer` | copy lifetime; wildfire attack timers |
| `yadventures-bosses.cooldown` | illusioner copy cooldown |
| `yadventures-bosses.decoy` | ring id a distracted mob should attack |
| `yadventures-bosses.health`, `yadventures-bosses.shields`, `yadventures-bosses.absorbed`, `yadventures-bosses.regen`, `yadventures-bosses.shield_hp` | wildfire shields |
| `yadventures-bosses.hits`, `yadventures-bosses.hit_damage`, `yadventures-bosses.hit_window` | illusioner escape (with `health`) |
| `yadventures-bosses.home_x`, `home_y`, `home_z` | spawner bosses' leash position |
| `yadventures-bosses.state`, `yadventures-bosses.attack_cd`, `yadventures-bosses.charge_x/y/z`, `yadventures-bosses.fired`, `yadventures-bosses.wander`, `yadventures-bosses.wander_x/z` | wildfire AI (`state` is also the Iceologer's current spell) |
| `yadventures-bosses.uid`, `yadventures-bosses.target` | Iceologer / ice chunk targets (`#next yadventures-bosses.uid` = counter) |
| `yadventures-bosses.hurt`, `yadventures-bosses.flags`, `yadventures-bosses.cast`, `yadventures-bosses.chunk_cd`, `yadventures-bosses.slow_cd`, `yadventures-bosses.stray_cd` | Iceologer: last HurtTime, model flags, cast tick, spell cooldowns (seconds) |
| `yadventures-bosses.age`, `yadventures-bosses.offset`, `yadventures-bosses.velocity` | ice chunk |
| `yadventures-bosses.frozen` | players' imitation freezing (ticks left) |

Storage `yadventures-bosses:data`: `shield_rotation`, and scratch space for macros (`ring`, `aim`, `blaze`,
`brew`, `spin`, `shields`).

Team `yadventures-bosses.illagers` (friendly fire off): the Iceologer and `#yadventures-bosses:prevent_aggression` mobs.
