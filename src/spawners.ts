import { LootTable, Predicate, Tag, TrialSpawner } from 'sandstone'
import { NO_DROPS } from './iceologer.ts'
import { count, itemEntry } from './items.ts'
import { fn, GRAY, snbt } from './lib.ts'

// ============================================================ trial spawners, keys and vaults
// Each boss structure gets a trial spawner (normal + ominous config) and a normal + ominous vault.
// The spawner spawns a bare mob tagged yadventures-bosses.convert, which the tick turns into the boss in
// place (the spawner tracks it by UUID). Beating it ejects a boss key per player, which opens the vault.
export const BOSS_ENTITY = { iceologer: 'minecraft:evoker', illusioner: 'minecraft:illusioner', wildfire: 'minecraft:blaze' }
type Boss = keyof typeof BOSS_ENTITY
export const BOSSES = Object.keys(BOSS_ENTITY) as Boss[]
export const BOSS_NAME: Record<Boss, string> = { iceologer: 'Iceologer', illusioner: 'Illusioner', wildfire: 'Wildfire' }
const SPAWN_RANGE: Record<Boss, number> = { iceologer: 2, illusioner: 3, wildfire: 4 }
const BOOLS = [false, true]
const prefixOf = (ominous: boolean) => (ominous ? 'ominous_' : '')

function bossNbt(boss: Boss, ominous: boolean, spawner: boolean) {
  const nbt: Record<string, unknown> = {
    id: BOSS_ENTITY[boss], Tags: ['yadventures-bosses.convert', `yadventures-bosses.convert.${boss}`,
      ...(ominous ? ['yadventures-bosses.ominous'] : []), ...(spawner ? ['yadventures-bosses.from_spawner'] : [])],
  }
  if (boss !== 'illusioner') { // hide the evoker / blaze until it's converted
    nbt.Silent = true
    nbt.active_effects = [{ id: 'minecraft:invisibility', duration: -1, show_particles: false }]
  }
  return nbt
}

function keyComponents(boss: Boss, ominous: boolean) {
  return {
    'minecraft:item_name': { translate: `item.yadventures-bosses.${prefixOf(ominous)}${boss}_key` },
    'minecraft:lore': [{ translate: `item.yadventures-bosses.${boss}_key.tooltip`, ...GRAY }],
    'minecraft:custom_data': { 'yadventures-bosses': { key: boss, ominous } },
  }
}

fn('yadventures-bosses:convert/run', `
tag @s remove yadventures-bosses.convert
tag @s add yadventures-bosses.converting
execute if entity @s[tag=yadventures-bosses.convert.iceologer] run function yadventures-bosses:convert/iceologer
execute if entity @s[tag=yadventures-bosses.convert.illusioner] run function yadventures-bosses:convert/illusioner
execute if entity @s[tag=yadventures-bosses.convert.wildfire] run function yadventures-bosses:convert/wildfire
# Health: x1.5 when ominous, then x0.5 on easy and x1.5 on hard
execute store result score #difficulty yadventures-bosses.dummy run difficulty
attribute @s[tag=yadventures-bosses.ominous] minecraft:max_health modifier add yadventures-bosses:ominous 0.5 add_multiplied_total
execute if score #difficulty yadventures-bosses.dummy matches 1 run attribute @s minecraft:max_health modifier add yadventures-bosses:difficulty -0.5 add_multiplied_total
execute if score #difficulty yadventures-bosses.dummy matches 3 run attribute @s minecraft:max_health modifier add yadventures-bosses:difficulty 0.5 add_multiplied_total
execute store result entity @s Health float 1 run attribute @s minecraft:max_health get
# A Wildfire shield breaks after absorbing a quarter of the max health
execute if entity @s[tag=yadventures-bosses.wildfire] store result score @s yadventures-bosses.shield_hp run attribute @s minecraft:max_health get 25
execute if entity @s[tag=yadventures-bosses.from_spawner] run function yadventures-bosses:spawner/set_home
execute if entity @s[tag=yadventures-bosses.from_spawner] align xyz positioned ~0.5 ~0.5 ~0.5 run function yadventures-bosses:spawner/find
tag @s remove yadventures-bosses.converting
`)
fn('yadventures-bosses:convert/illusioner', `
data merge entity @s {PersistenceRequired:1b,${NO_DROPS}}
item replace entity @s weapon.mainhand with minecraft:bow
attribute @s minecraft:max_health base set 48
`)
for (const boss of BOSSES) {
  for (const ominous of BOOLS) {
    const { id: entity, ...nbt } = bossNbt(boss, ominous, false)
    fn(`yadventures-bosses:commands/summon/${prefixOf(ominous)}${boss}`, `
# Summons ${ominous ? 'an ominous' : 'a'} ${BOSS_NAME[boss]} (not bound to a trial spawner)
summon ${entity} ~ ~ ~ ${snbt(nbt)}
execute as @e[type=${entity},tag=yadventures-bosses.convert,distance=..1] at @s run function yadventures-bosses:convert/run
`)
  }
}

// ---- leash: bosses that wander 47+ blocks from their spawner count as defeated, so they're brought back
fn('yadventures-bosses:spawner/set_home', `
tag @s add yadventures-bosses.leashed
execute store result score @s yadventures-bosses.home_x run data get entity @s Pos[0]
execute store result score @s yadventures-bosses.home_y run data get entity @s Pos[1]
execute store result score @s yadventures-bosses.home_z run data get entity @s Pos[2]
`)
fn('yadventures-bosses:spawner/leash', `
execute store result storage yadventures-bosses:data home.x int 1 run scoreboard players get @s yadventures-bosses.home_x
execute store result storage yadventures-bosses:data home.y int 1 run scoreboard players get @s yadventures-bosses.home_y
execute store result storage yadventures-bosses:data home.z int 1 run scoreboard players get @s yadventures-bosses.home_z
function yadventures-bosses:spawner/leash_check with storage yadventures-bosses:data home
`)
fn('yadventures-bosses:spawner/leash_check', `
$execute if entity @s[x=$(x),y=$(y),z=$(z),distance=..32] run return fail
execute at @s run particle minecraft:poof ~ ~1 ~ 0.3 0.6 0.3 0.02 15
$tp @s $(x) $(y) $(z)
execute at @s run particle minecraft:poof ~ ~1 ~ 0.3 0.6 0.3 0.02 15
`)

// ---- once per player per difficulty. Each spawner gets a marker (with a yadventures-bosses.id) when it
// first spawns its boss. Players near it when it's beaten get yadventures-bosses.beat.<id>.<normal|ominous>.
// While only players who already beat the difficulty they'd start (ominous with Bad/Trial Omen) are around,
// the spawner is locked: an ominous spawner in cooldown doesn't look for players at all, so the lock is
// the cooldown + ominous block state with a cooldown that never ends. Unlocking ends the cooldown, which
// resets the spawner (not ominous, waiting for players). The vanilla cooldown is only 1 minute.
const SPAWNER_COOLDOWN = 1200
Predicate('yadventures-bosses:has_omen', {
  type: 'minecraft:any_of', terms: ['minecraft:bad_omen', 'minecraft:trial_omen'].map((e) => (
    { type: 'minecraft:entity_properties', entity: 'this', predicate: { effects: { [e]: {} } } })),
} as any)
// The boss spawned within SPAWN_RANGE blocks of its spawner horizontally, and -1..1 vertically
const offsets: number[][] = []
for (let x = -4; x <= 4; x++) for (const y of [-1, 0, 1]) for (let z = -4; z <= 4; z++) offsets.push([x, y, z])
offsets.sort((a, b) => a.reduce((s, v) => s + v * v, 0) - b.reduce((s, v) => s + v * v, 0))
fn('yadventures-bosses:spawner/find', ['# Registers the trial spawner that spawned @s', ...offsets.map((o) =>
  `execute positioned ${o.map((v) => `~${v || ''}`).join(' ')} if block ~ ~ ~ minecraft:trial_spawner run return run function yadventures-bosses:spawner/register`)].join('\n'))
fn('yadventures-bosses:spawner/register', `
execute if entity @e[type=minecraft:marker,tag=yadventures-bosses.spawner,distance=..0.1] run return 1
summon minecraft:marker ~ ~ ~ {Tags:["yadventures-bosses.spawner"]}
scoreboard players add #next yadventures-bosses.id 1
scoreboard players operation @n[type=minecraft:marker,tag=yadventures-bosses.spawner,distance=..0.1] yadventures-bosses.id = #next yadventures-bosses.id
data modify block ~ ~ ~ target_cooldown_length set value ${SPAWNER_COOLDOWN}
`)
fn('yadventures-bosses:spawner/tick', `
execute unless block ~ ~ ~ minecraft:trial_spawner run return run kill @s
execute store result storage yadventures-bosses:data spawner.id int 1 run scoreboard players get @s yadventures-bosses.id
execute if block ~ ~ ~ minecraft:trial_spawner[trial_spawner_state=waiting_for_reward_ejection] run function yadventures-bosses:spawner/beaten with storage yadventures-bosses:data spawner
function yadventures-bosses:spawner/tag_eligible with storage yadventures-bosses:data spawner
execute if entity @s[tag=yadventures-bosses.locked] if entity @a[tag=yadventures-bosses.eligible] run function yadventures-bosses:spawner/unlock
execute if entity @s[tag=yadventures-bosses.locked] unless entity @a[gamemode=!creative,gamemode=!spectator,distance=..32] run function yadventures-bosses:spawner/unlock
execute if entity @s[tag=!yadventures-bosses.locked] unless entity @a[tag=yadventures-bosses.eligible] if entity @a[gamemode=!creative,gamemode=!spectator,distance=..20] run function yadventures-bosses:spawner/try_lock
tag @a[tag=yadventures-bosses.eligible] remove yadventures-bosses.eligible
`)
fn('yadventures-bosses:spawner/beaten', `
$execute if block ~ ~ ~ minecraft:trial_spawner[ominous=false] run tag @a[gamemode=!creative,gamemode=!spectator,distance=..48] add yadventures-bosses.beat.$(id).normal
$execute if block ~ ~ ~ minecraft:trial_spawner[ominous=true] run tag @a[gamemode=!creative,gamemode=!spectator,distance=..48] add yadventures-bosses.beat.$(id).ominous
`)
fn('yadventures-bosses:spawner/tag_eligible', `
# Players close enough to be detected soon, who haven't beaten the difficulty they'd start
$tag @a[gamemode=!creative,gamemode=!spectator,distance=..20,tag=!yadventures-bosses.beat.$(id).normal,predicate=!yadventures-bosses:has_omen] add yadventures-bosses.eligible
$tag @a[gamemode=!creative,gamemode=!spectator,distance=..20,tag=!yadventures-bosses.beat.$(id).ominous,predicate=yadventures-bosses:has_omen] add yadventures-bosses.eligible
`)
fn('yadventures-bosses:spawner/try_lock', `
# Never during a fight or its reward
execute unless block ~ ~ ~ minecraft:trial_spawner[trial_spawner_state=inactive] unless block ~ ~ ~ minecraft:trial_spawner[trial_spawner_state=waiting_for_players] unless block ~ ~ ~ minecraft:trial_spawner[trial_spawner_state=cooldown] run return fail
tag @s add yadventures-bosses.locked
setblock ~ ~ ~ minecraft:trial_spawner[trial_spawner_state=cooldown,ominous=true]
data modify block ~ ~ ~ cooldown_ends_at set value 9000000000000000000L
`)
fn('yadventures-bosses:spawner/unlock', `
tag @s remove yadventures-bosses.locked
setblock ~ ~ ~ minecraft:trial_spawner[trial_spawner_state=cooldown,ominous=false]
data modify block ~ ~ ~ cooldown_ends_at set value 0L
`)

LootTable('yadventures-bosses:spawner/nothing', { pools: [] } as any)
Tag('block', 'yadventures-bosses:vault_replaceable', [
  '#yadventures-bosses:passable', '#minecraft:wool_carpets', 'minecraft:moss_carpet', 'minecraft:pale_moss_carpet'] as any)

for (const boss of BOSSES) {
  for (const ominous of BOOLS) {
    const prefix = prefixOf(ominous)
    TrialSpawner(`yadventures-bosses:${boss}/${ominous ? 'ominous' : 'normal'}`, {
      spawn_range: SPAWN_RANGE[boss], total_mobs: 1, simultaneous_mobs: 1,
      total_mobs_added_per_player: 0, simultaneous_mobs_added_per_player: 0, ticks_between_spawn: 20,
      spawn_potentials: [{ weight: 1, data: { entity: bossNbt(boss, ominous, true) } }],
      loot_tables_to_eject: [{ weight: 1, data: `yadventures-bosses:spawner/${boss}/${prefix}key` }],
      items_to_drop_when_ominous: 'yadventures-bosses:spawner/nothing',
    } as any)
    LootTable(`yadventures-bosses:spawner/${boss}/${prefix}key`, { pools: [{ rolls: 1, entries: [
      { type: 'minecraft:item', name: `minecraft:${prefix}trial_key`,
        modifier: [{ type: 'minecraft:set_components', components: keyComponents(boss, ominous) }] }] }] } as any)
  }
}

// ---- vault loot (each player can open each vault once)
type Entry = Record<string, unknown>
function it(name: string, lo = 1, hi = 1, w = 1, mods: object[] = []): Entry {
  const e: Entry = { type: 'minecraft:item', name: `minecraft:${name}`, weight: w }
  const m = [...(lo !== 1 || hi !== 1 ? [count(lo, hi)] : []), ...mods]
  if (m.length) e.modifier = m
  return e
}
const book = (enchantments: string[], w = 1) =>
  it('book', 1, 1, w, [{ type: 'minecraft:enchant_randomly', options: enchantments.map((e) => `minecraft:${e}`) }])
const enchanted = (name: string, w = 1) =>
  it(name, 1, 1, w, [{ type: 'minecraft:enchant_with_levels', levels: { type: 'minecraft:uniform', min: 20, max: 30 } }])
const potion = (name: string, p: string, lo = 1, hi = 1, w = 1) =>
  it(name, lo, hi, w, [{ type: 'minecraft:set_potion', id: `minecraft:${p}` }])
const custom = (name: string, lo = 1, hi = 1, w = 1): Entry =>
  ({ ...itemEntry(name, lo !== 1 || hi !== 1 ? [count(lo, hi)] : []), weight: w })
export const pool = (rolls: number | [number, number], entries: object[]) =>
  ({ rolls: typeof rolls === 'number' ? rolls : { type: 'minecraft:uniform', min: rolls[0], max: rolls[1] }, entries })

const VAULT_LOOT: Record<Boss, Record<'signature' | 'rare' | 'common' | 'ominous', Entry[]>> = { // signature: guaranteed in both vaults
  iceologer: {
    signature: [custom('totem_of_freezing')],
    rare: [book(['frost_walker'], 2), it('diamond', 1, 2, 3), enchanted('diamond_boots')],
    common: [it('emerald', 2, 5, 3), it('blue_ice', 2, 4, 2), it('packed_ice', 4, 8, 2), it('snowball', 8, 16, 2),
      it('powder_snow_bucket'), it('golden_carrot', 2, 4, 2), it('golden_apple')],
    ominous: [book(['frost_walker'], 2), it('diamond', 2, 4, 3), enchanted('diamond_boots', 2),
      it('enchanted_golden_apple')],
  },
  illusioner: {
    signature: [custom('totem_of_illusion')],
    rare: [enchanted('bow', 2), book(['power', 'infinity', 'punch', 'flame'], 2), it('diamond', 1, 2, 3)],
    common: [it('emerald', 2, 5, 3), it('arrow', 8, 16, 2), it('spectral_arrow', 4, 8, 2), potion('tipped_arrow', 'slowness', 4, 8),
      potion('potion', 'long_invisibility'), potion('potion', 'long_night_vision'), it('golden_carrot', 2, 4, 2), it('golden_apple')],
    ominous: [enchanted('bow', 3), enchanted('crossbow'), it('diamond', 2, 4, 3),
      it('enchanted_golden_apple')],
  },
  wildfire: {
    signature: [custom('wildfire_crown_fragment', 3, 5)],
    rare: [custom('wildfire_crown_upgrade_smithing_template'), it('netherite_scrap', 1, 1, 2),
      book(['fire_protection', 'fire_aspect', 'flame'], 2), it('diamond', 1, 3, 3)],
    common: [it('blaze_rod', 2, 4, 3), it('fire_charge', 3, 6, 2), it('magma_cream', 2, 4, 2), it('gold_ingot', 3, 6, 2),
      it('emerald', 2, 5, 2), it('golden_apple')],
    ominous: [custom('wildfire_crown_upgrade_smithing_template', 1, 1, 2), it('netherite_scrap', 1, 2, 2), it('ancient_debris', 1, 1, 2),
      it('diamond', 2, 4, 2), it('enchanted_golden_apple')],
  },
}
for (const boss of BOSSES) {
  const loot = VAULT_LOOT[boss]
  LootTable(`yadventures-bosses:spawner/${boss}/vault`, { pools: [
    pool(1, loot.signature), pool(1, loot.rare), pool([2, 4], loot.common)] } as any)
  LootTable(`yadventures-bosses:spawner/${boss}/ominous_vault`, { pools: [
    pool(1, loot.signature), pool(1, loot.ominous), pool(1, loot.rare), pool([3, 5], loot.common)] } as any)
}

// Trial spawners and vaults (hardness 50, no drops) can be removed with a pickaxe (vanilla ones too). A player
// aiming at one with a pickaxe gets block_break_speed x0.147: ~15 s with a diamond Efficiency V pickaxe
// (instead of 2.2 s), ~64 s with a plain diamond one
const TRIAL_BREAK_SPEED = -0.853
Tag('block', 'minecraft:mineable/pickaxe', ['minecraft:trial_spawner', 'minecraft:vault'] as any)
Tag('block', 'yadventures-bosses:trial_blocks', ['minecraft:trial_spawner', 'minecraft:vault'] as any)
// Blocks the mining ray goes through (the game's block outline raycast ignores fluids)
Tag('block', 'yadventures-bosses:ray_through', [
  '#minecraft:air', 'minecraft:water', 'minecraft:lava', 'minecraft:bubble_column'] as any)
fn('yadventures-bosses:mining/tick', `
execute as @a[gamemode=survival] if items entity @s weapon.mainhand #minecraft:pickaxes at @s anchored eyes positioned ^ ^ ^ if function yadventures-bosses:mining/aim run tag @s add yadventures-bosses.aiming_trial_block
execute as @a[tag=yadventures-bosses.aiming_trial_block,tag=!yadventures-bosses.slow_mining] run attribute @s minecraft:block_break_speed modifier add yadventures-bosses:trial_block ${TRIAL_BREAK_SPEED} add_multiplied_total
tag @a[tag=yadventures-bosses.aiming_trial_block] add yadventures-bosses.slow_mining
execute as @a[tag=!yadventures-bosses.aiming_trial_block,tag=yadventures-bosses.slow_mining] run attribute @s minecraft:block_break_speed modifier remove yadventures-bosses:trial_block
tag @a[tag=!yadventures-bosses.aiming_trial_block] remove yadventures-bosses.slow_mining
tag @a remove yadventures-bosses.aiming_trial_block
`)
fn('yadventures-bosses:mining/aim', `
# Steps of 0.1 block, up to the player's block interaction range
execute store result score #steps yadventures-bosses.dummy run attribute @s minecraft:block_interaction_range get 10
return run function yadventures-bosses:mining/ray
`)
fn('yadventures-bosses:mining/ray', `
execute if block ~ ~ ~ #yadventures-bosses:trial_blocks run return 1
execute unless block ~ ~ ~ #yadventures-bosses:ray_through run return 0
scoreboard players remove #steps yadventures-bosses.dummy 1
execute if score #steps yadventures-bosses.dummy matches ..0 run return 0
execute positioned ^ ^ ^0.1 run return run function yadventures-bosses:mining/ray
`)

// ---- structure setup: the spawner stands on the floor at the marker, with a vault on each side of it
// (lined up with the structure, via the marker yaw, when both spots are free), all facing open space
const free = (x: number, z: number) =>
  (`if block ~${x} ~ ~${z} #yadventures-bosses:vault_replaceable if block ~${x} ~1 ~${z} #yadventures-bosses:passable `
    + `unless block ~${x} ~-1 ~${z} #yadventures-bosses:passable`).replaceAll('~0', '~')
const rel = (x: number, z: number) => `~${x || ''} ~ ~${z || ''}`

const vaultConfig = (boss: Boss, ominous: boolean) => ({
  loot_table: `yadventures-bosses:spawner/${boss}/${prefixOf(ominous)}vault`,
  key_item: { id: `minecraft:${prefixOf(ominous)}trial_key`, count: 1, components: keyComponents(boss, ominous) },
})
const vaultBlock = (boss: Boss, ominous: boolean, facing: string) =>
  `minecraft:vault[facing=${facing},ominous=${ominous}]${snbt({ config: vaultConfig(boss, ominous) })}`

// axis: vault offsets (a = normal, b = ominous) and the two directions they can face
const VAULT_ROWS: Record<string, [[number, number], [number, number], [string, number, number][]]> = {
  z: [[0, -1], [0, 1], [['west', -1, 0], ['east', 1, 0]]],
  x: [[-1, 0], [1, 0], [['north', 0, -1], ['south', 0, 1]]],
}
for (const boss of BOSSES) {
  const d = `yadventures-bosses:spawner/setup/${boss}`
  fn(d, `
execute positioned ~ ~-1 ~ run setblock ~ ~ ~ minecraft:trial_spawner{normal_config:"yadventures-bosses:${boss}/normal",ominous_config:"yadventures-bosses:${boss}/ominous",target_cooldown_length:${SPAWNER_COOLDOWN}}
execute store result score #yaw yadventures-bosses.dummy run data get entity @s Rotation[0]
scoreboard players operation #yaw yadventures-bosses.dummy %= #180 yadventures-bosses.dummy
scoreboard players set #placed yadventures-bosses.dummy 0
execute if score #yaw yadventures-bosses.dummy matches 45..134 positioned ~ ~-1 ~ run function ${d}/vaults_x
execute if score #placed yadventures-bosses.dummy matches 0 positioned ~ ~-1 ~ run function ${d}/vaults_z
execute if score #placed yadventures-bosses.dummy matches 0 positioned ~ ~-1 ~ run function ${d}/vaults_x
execute if score #placed yadventures-bosses.dummy matches 0 positioned ~ ~-1 ~ run function ${d}/place_z
`)
  for (const [axis, [[ax, az], [bx, bz], faces]] of Object.entries(VAULT_ROWS)) {
    fn(`${d}/vaults_${axis}`, `
execute ${free(ax, az)} ${free(bx, bz)} run return run function ${d}/place_${axis}
`)
    const [[f1, dx1, dz1], [f2]] = faces
    fn(`${d}/place_${axis}`, `
scoreboard players set #placed yadventures-bosses.dummy 1
execute if block ${rel(ax + dx1, az + dz1)} #yadventures-bosses:passable if block ${rel(bx + dx1, bz + dz1)} #yadventures-bosses:passable run return run function ${d}/place_${axis}_${f1}
function ${d}/place_${axis}_${f2}
`)
    for (const [f] of faces) {
      fn(`${d}/place_${axis}_${f}`, `
setblock ${rel(ax, az)} ${vaultBlock(boss, false, f)}
setblock ${rel(bx, bz)} ${vaultBlock(boss, true, f)}
`)
    }
  }
}

const itemComponents = (components: Record<string, unknown>) =>
  `[${Object.entries(components).map(([k, v]) => `${k}=${snbt(v)}`).join(',')}]`

// ---- give: a configured spawner and vaults, to place by hand (e.g. when editing a structure; a boss spawner
// without a setup marker registers itself when it first spawns its boss). Needs creative + operator.
for (const boss of BOSSES) {
  const spawner = {
    'minecraft:block_entity_data': {
      id: 'minecraft:trial_spawner',
      normal_config: `yadventures-bosses:${boss}/normal`, ominous_config: `yadventures-bosses:${boss}/ominous`,
      target_cooldown_length: SPAWNER_COOLDOWN,
    },
    'minecraft:item_name': `${BOSS_NAME[boss]} Trial Spawner`,
  }
  const lines = [`give @s minecraft:trial_spawner${itemComponents(spawner)}`]
  for (const ominous of BOOLS) {
    const vault = {
      'minecraft:block_entity_data': { id: 'minecraft:vault', config: vaultConfig(boss, ominous) },
      'minecraft:block_state': { ominous: `${ominous}` },
      'minecraft:item_name': `${BOSS_NAME[boss]} ${ominous ? 'Ominous ' : ''}Vault`,
    }
    lines.push(`give @s minecraft:vault${itemComponents(vault)}`)
  }
  fn(`yadventures-bosses:commands/give/${boss}_trial_blocks`, lines.join('\n'))
}

export const KEY_LANG: Record<string, string> = {}
for (const boss of BOSSES) {
  const name = BOSS_NAME[boss]
  KEY_LANG[`item.yadventures-bosses.${boss}_key`] = `${name} Key`
  KEY_LANG[`item.yadventures-bosses.ominous_${boss}_key`] = `Ominous ${name} Key`
  KEY_LANG[`item.yadventures-bosses.${boss}_key.tooltip`] = `Opens a vault at the ${name}'s lair`
}
