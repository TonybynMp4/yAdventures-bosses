import { Tag } from 'sandstone'
import { fn, pyFloat, range } from './lib.ts'

// ============================================================ load / tick
const round6 = (x: number) => Math.round(x * 1e6) / 1e6
const shieldRotation = range(8).map((k) => {
  const a = (k * 22.5 * Math.PI) / 180
  return [0, round6(-Math.sin(a)), 0, round6(Math.cos(a))]
})
const OBJECTIVES = `dummy id timer cooldown health shields absorbed regen state attack_cd charge_x charge_y charge_z
  fired decoy uid target hurt cast chunk_cd slow_cd stray_cd frozen age offset velocity shield_hp home_x home_y
  home_z wander wander_x wander_z hits hit_damage hit_window`.trim().split(/\s+/)

const load = fn('yadventures-bosses:load', `
# yAdventures bosses: Iceologer, Illusioner, Wildfire
${OBJECTIVES.map((o) => `scoreboard objectives add yadventures-bosses.${o} dummy`).join('\n')}

${[2, 8, 20, 40, 180].map((n) => `scoreboard players set #${n} yadventures-bosses.dummy ${n}`).join('\n')}

team add yadventures-bosses.illagers
team modify yadventures-bosses.illagers friendlyFire false

data modify storage yadventures-bosses:data shield_rotation set value [${shieldRotation.map((q) => `[${q.map((x) => `${pyFloat(x)}f`).join(',')}]`).join(',')}]

schedule function yadventures-bosses:second 1s replace
`)

const tick = fn('yadventures-bosses:tick', `
# Illagers and zombies join the Iceologer's team (every tick: a new mob targets it within its first second)
team join yadventures-bosses.illagers @e[type=#yadventures-bosses:prevent_aggression,team=]

# Bosses spawned by trial spawners (or summon commands) become the real thing
execute as @e[tag=yadventures-bosses.convert] at @s run function yadventures-bosses:convert/run

# Trial spawners: once per player per difficulty
execute as @e[type=minecraft:marker,tag=yadventures-bosses.spawner] at @s run function yadventures-bosses:spawner/tick
# Trial spawners and vaults are slow to mine
function yadventures-bosses:mining/tick

# Structure setup markers and cabin armor stands
execute as @e[type=minecraft:marker,tag=yadventures-bosses.setup] at @s run function yadventures-bosses:setup/run
execute as @e[type=minecraft:armor_stand,tag=yadventures-bosses.cabin_armor_stand] run function yadventures-bosses:setup/armor_stand

# Iceologers, ice chunks and frozen players
# Dying entities can't be selected with @e, so each boss is ticked through a passenger (it still sees the dying vehicle)
execute as @e[type=minecraft:marker,tag=yadventures-bosses.iceologer_link] run function yadventures-bosses:iceologer/link
execute as @e[type=minecraft:item_display,tag=yadventures-bosses.ice_chunk] at @s run function yadventures-bosses:ice_chunk/tick
execute as @a[scores={yadventures-bosses.frozen=1..}] at @s run function yadventures-bosses:iceologer/frozen_player

# Illusioners and player illusions
execute as @e[type=minecraft:illusioner] at @s run function yadventures-bosses:illusioner/tick
execute as @e[type=minecraft:mannequin,tag=yadventures-bosses.player_illusion] at @s run function yadventures-bosses:totem/illusion_tick

# Wildfires
execute store result score #gametime yadventures-bosses.dummy run time query gametime
scoreboard players operation #spin yadventures-bosses.dummy = #gametime yadventures-bosses.dummy
scoreboard players operation #spin yadventures-bosses.dummy %= #20 yadventures-bosses.dummy
execute if score #spin yadventures-bosses.dummy matches 0 run function yadventures-bosses:wildfire/spin
execute as @e[type=minecraft:item_display,tag=yadventures-bosses.wildfire_body] on vehicle at @s run function yadventures-bosses:wildfire/tick
kill @e[type=minecraft:item_display,tag=yadventures-bosses.wildfire_part,predicate=!yadventures-bosses:is_passenger]
# The vanilla blaze attack still runs: remove its fireballs so only the Wildfire's own volleys remain
execute as @e[type=minecraft:small_fireball,tag=!yadventures-bosses.debris] if function yadventures-bosses:wildfire/owns_fireball run kill @s
`)

fn('yadventures-bosses:second', `
execute store result score #difficulty yadventures-bosses.dummy run difficulty

execute as @e[type=minecraft:wandering_trader,tag=yadventures-bosses.iceologer] at @s run function yadventures-bosses:iceologer/second
execute as @a[predicate=yadventures-bosses:wearing_wildfire_crown] run function yadventures-bosses:crown/wearer
execute as @e[tag=yadventures-bosses.leashed] run function yadventures-bosses:spawner/leash

schedule function yadventures-bosses:second 1s replace
`)
fn('yadventures-bosses:crown/wearer', `
# Fire resistance while not burning
effect give @s[predicate=!yadventures-bosses:burning] minecraft:fire_resistance 8 0 true
`)

// Our own load/tick tags, not Sandstone's Lantern Load (excluded in sandstone.config.ts)
Tag('function', 'minecraft:load', [load], { onConflict: 'replace' })
Tag('function', 'minecraft:tick', [tick])

// ============================================================ structure setup
fn('yadventures-bosses:setup/run', `
execute if entity @s[tag=yadventures-bosses.spawn_wildfire] run function yadventures-bosses:spawner/setup/wildfire
execute if entity @s[tag=yadventures-bosses.spawn_iceologer] run function yadventures-bosses:spawner/setup/iceologer
execute if entity @s[tag=yadventures-bosses.spawn_illusioner] run function yadventures-bosses:spawner/setup/illusioner
execute if entity @s[tag=yadventures-bosses.setup_brewing_stand] run function yadventures-bosses:setup/brewing_stand
execute if entity @s[tag=yadventures-bosses.citadel_pillar] positioned ~ ~-1 ~ run function yadventures-bosses:setup/pillar
kill @s
`)

fn('yadventures-bosses:setup/pillar', `
# Extends the citadel foundations down to the ground
execute unless block ~ ~ ~ #yadventures-bosses:citadel_pillar_replaceable run return 0
setblock ~ ~ ~ minecraft:nether_bricks
execute positioned ~ ~-1 ~ run function yadventures-bosses:setup/pillar
`)

fn('yadventures-bosses:setup/brewing_stand', `
# Random potions for the illusioner shack brewing stands
execute if predicate yadventures-bosses:chance/half run data modify storage yadventures-bosses:data brew set value {Items:[{Slot:3b,id:"minecraft:golden_carrot",count:2}],potion:"minecraft:night_vision"}
execute unless data storage yadventures-bosses:data brew.Items run data modify storage yadventures-bosses:data brew set value {Items:[{Slot:3b,id:"minecraft:fermented_spider_eye",count:1}],potion:"minecraft:invisibility"}
function yadventures-bosses:setup/brewing_stand_potion {slot:1}
execute if predicate yadventures-bosses:chance/half run function yadventures-bosses:setup/brewing_stand_potion {slot:0}
execute if predicate yadventures-bosses:chance/half run function yadventures-bosses:setup/brewing_stand_potion {slot:2}
data modify block ~ ~ ~ Items set from storage yadventures-bosses:data brew.Items
data remove storage yadventures-bosses:data brew
`)
fn('yadventures-bosses:setup/brewing_stand_potion', `
$data modify storage yadventures-bosses:data brew.Items append value {Slot:$(slot)b,id:"minecraft:potion",count:1}
data modify storage yadventures-bosses:data brew.Items[-1].components."minecraft:potion_contents".potion set from storage yadventures-bosses:data brew.potion
`)

fn('yadventures-bosses:setup/armor_stand', `
tag @s remove yadventures-bosses.cabin_armor_stand
item replace entity @s armor.head with minecraft:leather_helmet
execute if predicate yadventures-bosses:chance/third run item replace entity @s armor.chest with minecraft:leather_chestplate
execute if predicate yadventures-bosses:chance/third run item replace entity @s armor.legs with minecraft:leather_leggings
execute if predicate yadventures-bosses:chance/third run item replace entity @s armor.feet with minecraft:leather_boots
`)

// ============================================================ ring of illusions (shared by illusioner + totem)
// #mode: 0 = illusioner, 1 = player, 2 = teleport only (illusioner escape). #tp = index of the point the caster teleports to.
fn('yadventures-bosses:util/ring', `
$execute rotated $(yaw) 0 run function yadventures-bosses:util/ring_points
`)
fn('yadventures-bosses:util/ring_points', [
  'scoreboard players set #i yadventures-bosses.dummy 0',
  ...range(9).map((k) => `execute rotated ~${k * 40} 0 positioned ^ ^ ^9 run function yadventures-bosses:util/ring_point`),
].join('\n'))
fn('yadventures-bosses:util/ring_point', `
scoreboard players add #i yadventures-bosses.dummy 1
scoreboard players set #found yadventures-bosses.dummy 0
scoreboard players set #depth yadventures-bosses.dummy 0
function yadventures-bosses:util/ground_down
scoreboard players set #depth yadventures-bosses.dummy 0
execute if score #found yadventures-bosses.dummy matches 0 positioned ~ ~1 ~ run function yadventures-bosses:util/ground_up
`)
const GROUND = 'if block ~ ~ ~ #yadventures-bosses:passable if block ~ ~1 ~ #yadventures-bosses:passable unless block ~ ~-1 ~ #yadventures-bosses:passable unless block ~ ~-1 ~ minecraft:lava unless block ~ ~-1 ~ minecraft:water'
for (const [dir, dy] of [['down', '-1'], ['up', '1']]) {
  fn(`yadventures-bosses:util/ground_${dir}`, `
execute ${GROUND} align y run return run function yadventures-bosses:util/ring_action
scoreboard players add #depth yadventures-bosses.dummy 1
execute if score #depth yadventures-bosses.dummy matches ..16 positioned ~ ~${dy} ~ run function yadventures-bosses:util/ground_${dir}
`)
}
fn('yadventures-bosses:util/ring_action', `
scoreboard players set #found yadventures-bosses.dummy 1
execute if score #i yadventures-bosses.dummy = #tp yadventures-bosses.dummy run return run function yadventures-bosses:util/ring_teleport
execute if score #mode yadventures-bosses.dummy matches 2 run return 0
execute if score #mode yadventures-bosses.dummy matches 0 run return run function yadventures-bosses:illusioner/summon_illusion
function yadventures-bosses:totem/summon_illusion
`)
fn('yadventures-bosses:util/ring_teleport', `
tp @s ~ ~ ~
particle minecraft:cloud ~ ~1 ~ 0.3 0.6 0.3 0.05 16
`)
fn('yadventures-bosses:util/start_ring', `
# Shared setup: new illusion id, random teleport point and ring rotation
scoreboard players add #next yadventures-bosses.id 1
scoreboard players operation @s yadventures-bosses.id = #next yadventures-bosses.id
scoreboard players operation #id yadventures-bosses.dummy = @s yadventures-bosses.id
execute store result score #tp yadventures-bosses.dummy run random value 1..9
execute store result storage yadventures-bosses:data ring.yaw int 1 run random value 0..359
function yadventures-bosses:util/ring with storage yadventures-bosses:data ring
`)
fn('yadventures-bosses:util/vanish', `
particle minecraft:poof ~ ~1 ~ 0.3 0.6 0.3 0.02 15
tp @s ~ -1000 ~
kill @s
`)
