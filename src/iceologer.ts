import { fn } from './lib.ts'

// ============================================================ iceologer
// An invisible wandering trader wearing the model: the head item renders on its head and the mainhand
// item (refreshed from armor.chest every tick) renders in the crossed-arms layer.
// custom_model_data flags: head [hurt], body [hurt, moving, spellcasting]
// yadventures-bosses.state: spell being cast (1 = ice chunk, 2 = slowness, 3 = summon strays). Targets are remembered by their yadventures-bosses.uid.
const flags = (values: boolean[], offset = 0) => JSON.stringify({
  type: 'minecraft:set_custom_model_data',
  flags: { mode: 'replace_section', offset, size: values.length, values },
})

const HURT_ON = flags([true])
const HURT_OFF = flags([false])
const ICE_HEAD = '{id:"minecraft:stone",count:1,components:{"minecraft:item_model":"yadventures-bosses:iceologer/head","minecraft:custom_model_data":{flags:[0b]}}}'
const ICE_BODY = '{id:"minecraft:stone",count:1,components:{"minecraft:item_model":"yadventures-bosses:iceologer/body","minecraft:custom_model_data":{flags:[0b,0b,0b]}}}'
export const NO_DROPS = 'drop_chances:{mainhand:0f,offhand:0f,head:0f,chest:0f,legs:0f,feet:0f}'
export const INVISIBLE = 'active_effects:[{id:"minecraft:invisibility",duration:-1,amplifier:0b,show_particles:0b}]'
fn('yadventures-bosses:convert/iceologer', `
# An invisible wandering trader wearing item models
data merge entity @s {CustomName:{"translate":"entity.yadventures-bosses.iceologer"},Silent:1b,PersistenceRequired:1b,DespawnDelay:0,DeathLootTable:"yadventures-bosses:entities/iceologer",Offers:{Recipes:[]},${INVISIBLE},${NO_DROPS},equipment:{head:${ICE_HEAD},mainhand:${ICE_BODY},chest:${ICE_BODY}}}
tag @s add yadventures-bosses.iceologer
tag @s add yadventures.boss.iceologer
team join yadventures-bosses.illagers @s
attribute @s minecraft:follow_range base set 18
attribute @s minecraft:max_health base set 36
summon minecraft:marker ~ ~ ~ {Tags:["yadventures-bosses.iceologer_link","yadventures-bosses.new"]}
ride @n[type=minecraft:marker,tag=yadventures-bosses.new,distance=..1] mount @s
tag @e[type=minecraft:marker,tag=yadventures-bosses.new,distance=..1] remove yadventures-bosses.new
function yadventures-bosses:iceologer/init
`)
fn('yadventures-bosses:iceologer/init', `
scoreboard players add #next yadventures-bosses.id 1
scoreboard players operation @s yadventures-bosses.id = #next yadventures-bosses.id
scoreboard players set @s yadventures-bosses.hurt 0
scoreboard players set @s yadventures-bosses.cast 0
scoreboard players set @s yadventures-bosses.chunk_cd 0
scoreboard players set @s yadventures-bosses.slow_cd 0
scoreboard players set @s yadventures-bosses.stray_cd 10
`)
fn('yadventures-bosses:iceologer/link', `
execute unless predicate yadventures-bosses:is_passenger run return run kill @s
execute on vehicle at @s run function yadventures-bosses:iceologer/tick
`)
fn('yadventures-bosses:util/uid', `
# Gives @s a permanent target id and puts it in #uid
execute unless score @s yadventures-bosses.uid matches 1.. run scoreboard players add #next yadventures-bosses.uid 1
execute unless score @s yadventures-bosses.uid matches 1.. run scoreboard players operation @s yadventures-bosses.uid = #next yadventures-bosses.uid
scoreboard players operation #uid yadventures-bosses.dummy = @s yadventures-bosses.uid
`)
fn('yadventures-bosses:util/tag_target', `
# Tags the entity whose yadventures-bosses.uid is @s's yadventures-bosses.target with yadventures-bosses.target
execute unless score @s yadventures-bosses.target matches 1.. run return fail
scoreboard players operation #t yadventures-bosses.dummy = @s yadventures-bosses.target
execute as @e[scores={yadventures-bosses.uid=1..},distance=..64] if score @s yadventures-bosses.uid = #t yadventures-bosses.dummy run tag @s add yadventures-bosses.target
`)

// The wandering trader's "drink milk while invisible in daylight" goal can't be removed: it puts a milk bucket
// in the mainhand and drinks it, then restarts. Replacing that milk with the body item would make it stop and
// restart every other tick (flickering milk), so the milk is modified in place instead: it looks like the body
// and has no consumable component, so drinking it does nothing and leaves it in the hand.
const MILK_DISGUISE = '{type:"minecraft:set_components",components:{"minecraft:item_model":"yadventures-bosses:iceologer/body","minecraft:custom_model_data":{flags:[0b,0b,0b]},"!minecraft:consumable":{}}}'
fn('yadventures-bosses:iceologer/tick', `
execute if entity @s[tag=yadventures-bosses.dead] if items entity @s weapon.mainhand minecraft:milk_bucket[minecraft:consumable] run item modify entity @s weapon.mainhand [${MILK_DISGUISE},${flags([true, false, false])}]
execute if entity @s[tag=yadventures-bosses.dead] run return fail
execute unless items entity @s weapon.mainhand minecraft:milk_bucket run item replace entity @s weapon.mainhand from entity @s armor.chest
execute if items entity @s weapon.mainhand minecraft:milk_bucket run item modify entity @s weapon.mainhand ${MILK_DISGUISE}
execute if score @s yadventures-bosses.cast matches 1.. if items entity @s weapon.mainhand minecraft:milk_bucket run item modify entity @s weapon.mainhand ${flags([true], 2)}
item modify entity @s[predicate=yadventures-bosses:moving] weapon.mainhand ${flags([true], 1)}
execute store result score #hp yadventures-bosses.dummy run data get entity @s Health 100
execute if score #hp yadventures-bosses.dummy matches ..0 run return run function yadventures-bosses:iceologer/death

# Hurt: red tint while HurtTime > 0
execute store result score #hurt yadventures-bosses.dummy run data get entity @s HurtTime
execute if score #hurt yadventures-bosses.dummy > @s yadventures-bosses.hurt run function yadventures-bosses:iceologer/hurt
scoreboard players operation @s yadventures-bosses.hurt = #hurt yadventures-bosses.dummy
execute if score #hurt yadventures-bosses.dummy matches 1.. run item modify entity @s weapon.mainhand ${HURT_ON}
execute if score #hurt yadventures-bosses.dummy matches 1.. run item modify entity @s armor.head ${HURT_ON}
execute if score #hurt yadventures-bosses.dummy matches 0 run item modify entity @s armor.head ${HURT_OFF}

execute if score @s yadventures-bosses.cast matches 1.. run function yadventures-bosses:iceologer/cast/tick
`)
fn('yadventures-bosses:iceologer/hurt', `
playsound yadventures-bosses:entity.iceologer.hurt hostile @a ~ ~ ~ 1 1
# Retaliate against whoever hurt it (except illagers and creative players)
scoreboard players set #uid yadventures-bosses.dummy 0
execute on attacker unless entity @s[type=#minecraft:illager] unless entity @s[tag=yadventures-bosses.iceologer] unless entity @s[type=minecraft:player,gamemode=creative] run function yadventures-bosses:util/uid
execute if score #uid yadventures-bosses.dummy matches 1.. run scoreboard players operation @s yadventures-bosses.target = #uid yadventures-bosses.dummy
`)
fn('yadventures-bosses:iceologer/death', `
tag @s add yadventures-bosses.dead
playsound yadventures-bosses:entity.iceologer.death hostile @a ~ ~ ~ 1 1
item modify entity @s armor.head ${HURT_ON}
item modify entity @s weapon.mainhand ${flags([true, false, false])}
execute on attacker if entity @s[type=minecraft:player] run summon minecraft:experience_orb ~ ~ ~ {Value:10s}
`)

fn('yadventures-bosses:iceologer/second', `
execute if entity @s[tag=yadventures-bosses.dead] run return fail
execute if score #difficulty yadventures-bosses.dummy matches 0 run return run function yadventures-bosses:util/vanish
# Just in case something clears it (the milk it drinks in daylight is made harmless in iceologer/tick)
effect give @s minecraft:invisibility infinite 0 true
execute if predicate yadventures-bosses:chance/iceologer_ambient run playsound yadventures-bosses:entity.iceologer.ambient hostile @a ~ ~ ~ 1 1
execute if score @s yadventures-bosses.chunk_cd matches 1.. run scoreboard players remove @s yadventures-bosses.chunk_cd 1
execute if score @s yadventures-bosses.slow_cd matches 1.. run scoreboard players remove @s yadventures-bosses.slow_cd 1
execute if score @s yadventures-bosses.stray_cd matches 1.. run scoreboard players remove @s yadventures-bosses.stray_cd 1

# Keep away from players
execute if entity @a[gamemode=!creative,gamemode=!spectator,distance=..8] run function yadventures-bosses:iceologer/flee
execute unless entity @a[gamemode=!creative,gamemode=!spectator,distance=..8] run function yadventures-bosses:iceologer/stop_fleeing

# Forget targets that are gone, out of follow range or in creative/spectator, then look for a new one
function yadventures-bosses:util/tag_target
execute unless entity @e[tag=yadventures-bosses.target,distance=..18] run scoreboard players reset @s yadventures-bosses.target
execute if entity @e[type=minecraft:player,tag=yadventures-bosses.target,gamemode=!survival,gamemode=!adventure] run scoreboard players reset @s yadventures-bosses.target
tag @e[tag=yadventures-bosses.target] remove yadventures-bosses.target
execute unless score @s yadventures-bosses.target matches 1.. run function yadventures-bosses:iceologer/find_target
execute if score @s yadventures-bosses.cast matches 0 if score @s yadventures-bosses.target matches 1.. run function yadventures-bosses:iceologer/cast/start
`)
fn('yadventures-bosses:iceologer/flee', `
attribute @s minecraft:movement_speed modifier remove yadventures-bosses:flee
attribute @s minecraft:movement_speed modifier add yadventures-bosses:flee 1 add_multiplied_base
execute facing entity @p[gamemode=!creative,gamemode=!spectator,distance=..8] feet rotated ~180 0 positioned ^ ^ ^10 run function yadventures-bosses:iceologer/set_wander_target
`)
fn('yadventures-bosses:iceologer/set_wander_target', `
# The wandering trader walks to its wander_target
summon minecraft:marker ~ ~ ~ {Tags:["yadventures-bosses.aim"]}
data modify entity @s wander_target set value [I;0,0,0]
execute store result entity @s wander_target[0] int 1 run data get entity @n[type=minecraft:marker,tag=yadventures-bosses.aim] Pos[0]
execute store result entity @s wander_target[1] int 1 run data get entity @n[type=minecraft:marker,tag=yadventures-bosses.aim] Pos[1]
execute store result entity @s wander_target[2] int 1 run data get entity @n[type=minecraft:marker,tag=yadventures-bosses.aim] Pos[2]
kill @e[type=minecraft:marker,tag=yadventures-bosses.aim,distance=..1]
`)
fn('yadventures-bosses:iceologer/stop_fleeing', `
attribute @s minecraft:movement_speed modifier remove yadventures-bosses:flee
execute if data entity @s wander_target run data remove entity @s wander_target
`)

// ---- targeting: nearest player in sight within 16 blocks, else nearest golem / villager / glow squid
fn('yadventures-bosses:iceologer/find_target', `
tag @e[type=minecraft:player,gamemode=!creative,gamemode=!spectator,distance=..16] add yadventures-bosses.candidate
function yadventures-bosses:iceologer/find_target_loop
execute if score @s yadventures-bosses.target matches 1.. run return 1
tag @e[type=#yadventures-bosses:iceologer_targets,type=!minecraft:player,tag=!yadventures-bosses.iceologer,distance=..16] add yadventures-bosses.candidate
function yadventures-bosses:iceologer/find_target_loop
`)
fn('yadventures-bosses:iceologer/find_target_loop', `
execute unless entity @e[tag=yadventures-bosses.candidate,distance=..16] run return fail
tag @n[tag=yadventures-bosses.candidate,distance=..16] add yadventures-bosses.ray_target
scoreboard players set #los yadventures-bosses.dummy 0
scoreboard players set #steps yadventures-bosses.dummy 0
execute anchored eyes positioned ^ ^ ^ facing entity @n[tag=yadventures-bosses.ray_target] eyes run function yadventures-bosses:util/raycast
execute if score #los yadventures-bosses.dummy matches 1 as @n[tag=yadventures-bosses.ray_target] run function yadventures-bosses:util/uid
execute if score #los yadventures-bosses.dummy matches 1 run scoreboard players operation @s yadventures-bosses.target = #uid yadventures-bosses.dummy
execute if score #los yadventures-bosses.dummy matches 1 run tag @e[tag=yadventures-bosses.candidate] remove yadventures-bosses.candidate
tag @e[tag=yadventures-bosses.ray_target] remove yadventures-bosses.candidate
tag @e[tag=yadventures-bosses.ray_target] remove yadventures-bosses.ray_target
execute if score #los yadventures-bosses.dummy matches 0 run function yadventures-bosses:iceologer/find_target_loop
`)
fn('yadventures-bosses:util/raycast', `
# Line of sight to yadventures-bosses.ray_target through #yadventures-bosses:see_through blocks (#los = 1 if it's visible)
execute positioned ~-0.5 ~-0.5 ~-0.5 if entity @e[tag=yadventures-bosses.ray_target,dx=0,dy=0,dz=0] run return run scoreboard players set #los yadventures-bosses.dummy 1
execute unless block ~ ~ ~ #yadventures-bosses:see_through run return fail
scoreboard players add #steps yadventures-bosses.dummy 1
execute if score #steps yadventures-bosses.dummy matches ..40 positioned ^ ^ ^0.5 run function yadventures-bosses:util/raycast
`)

// ---- spells: 20-tick warmup, then the spell; arms stay raised for the casting time
fn('yadventures-bosses:iceologer/cast/start', `
scoreboard players set #spell yadventures-bosses.dummy 0
execute if score @s yadventures-bosses.slow_cd matches ..0 run scoreboard players set #spell yadventures-bosses.dummy 2
execute if score @s yadventures-bosses.chunk_cd matches ..0 run scoreboard players set #spell yadventures-bosses.dummy 1
execute if score @s yadventures-bosses.stray_cd matches ..0 run function yadventures-bosses:iceologer/count_strays
execute if score @s yadventures-bosses.stray_cd matches ..0 if score #count yadventures-bosses.dummy matches ..1 run scoreboard players set #spell yadventures-bosses.dummy 3
execute if score #spell yadventures-bosses.dummy matches 0 run return fail
scoreboard players operation @s yadventures-bosses.state = #spell yadventures-bosses.dummy
scoreboard players set @s yadventures-bosses.cast 1
execute if score #spell yadventures-bosses.dummy matches 1 run scoreboard players set @s yadventures-bosses.chunk_cd 8
execute if score #spell yadventures-bosses.dummy matches 1 if entity @s[tag=yadventures-bosses.ominous] run scoreboard players set @s yadventures-bosses.chunk_cd 5
execute if score #spell yadventures-bosses.dummy matches 1 run playsound yadventures-bosses:entity.iceologer.prepare_summon hostile @a ~ ~ ~ 1 1
execute if score #spell yadventures-bosses.dummy matches 2 run scoreboard players set @s yadventures-bosses.slow_cd 11
execute if score #spell yadventures-bosses.dummy matches 2 if entity @s[tag=yadventures-bosses.ominous] run scoreboard players set @s yadventures-bosses.slow_cd 7
execute if score #spell yadventures-bosses.dummy matches 2 run playsound yadventures-bosses:entity.iceologer.prepare_slowness hostile @a ~ ~ ~ 1 1
execute if score #spell yadventures-bosses.dummy matches 3 run scoreboard players set @s yadventures-bosses.stray_cd 24
execute if score #spell yadventures-bosses.dummy matches 3 if entity @s[tag=yadventures-bosses.ominous] run scoreboard players set @s yadventures-bosses.stray_cd 16
execute if score #spell yadventures-bosses.dummy matches 3 run playsound yadventures-bosses:entity.iceologer.prepare_summon hostile @a ~ ~ ~ 1 1
item modify entity @s armor.chest ${flags([true], 2)}
attribute @s minecraft:movement_speed modifier add yadventures-bosses:casting -1 add_multiplied_total
`)
const SPELL_COLORS = ['0.4,0.3,0.35', '0.1,0.1,0.2', '0.7,0.85,0.95']
fn('yadventures-bosses:iceologer/cast/tick', `
scoreboard players add @s yadventures-bosses.cast 1
function yadventures-bosses:util/tag_target
execute if entity @e[tag=yadventures-bosses.target,distance=..48] run rotate @s facing entity @n[tag=yadventures-bosses.target] eyes
${SPELL_COLORS.flatMap((color, i) => ['^0.6', '^-0.6'].map((x) =>
  `execute if score @s yadventures-bosses.state matches ${i + 1} rotated as @s rotated ~ 0 run particle minecraft:entity_effect{color:[${color},1.0]} ${x} ^1.8 ^ 0 0 0 1 0`)).join('\n')}
execute if score @s yadventures-bosses.cast matches 20 if entity @e[tag=yadventures-bosses.target,distance=..48] run function yadventures-bosses:iceologer/cast/perform
tag @e[tag=yadventures-bosses.target] remove yadventures-bosses.target
execute if score @s yadventures-bosses.state matches 1 if score @s yadventures-bosses.cast matches 30.. run function yadventures-bosses:iceologer/cast/end
execute if score @s yadventures-bosses.state matches 2..3 if score @s yadventures-bosses.cast matches 20.. run function yadventures-bosses:iceologer/cast/end
`)
fn('yadventures-bosses:iceologer/cast/perform', `
playsound yadventures-bosses:entity.iceologer.cast_spell hostile @a ~ ~ ~ 1 1
scoreboard players operation #id yadventures-bosses.dummy = @s yadventures-bosses.id
execute if score @s yadventures-bosses.state matches 1 as @n[tag=yadventures-bosses.target] at @s run function yadventures-bosses:ice_chunk/summon
execute if score @s yadventures-bosses.state matches 2 as @n[tag=yadventures-bosses.target] at @s run function yadventures-bosses:iceologer/freeze
execute if score @s yadventures-bosses.state matches 3 run function yadventures-bosses:iceologer/strays/summon
`)

// ---- summon strays: 3-4 (ominous 4) at random spots within 10 blocks, only while at most 1 of its own is alive.
// They wear a helmet so they don't burn in daylight, and join its team so their arrows don't hit it.
fn('yadventures-bosses:iceologer/count_strays', `
scoreboard players operation #id yadventures-bosses.dummy = @s yadventures-bosses.id
scoreboard players set #count yadventures-bosses.dummy 0
execute as @e[type=minecraft:stray,tag=yadventures-bosses.iceologer_stray,distance=..64] if score @s yadventures-bosses.id = #id yadventures-bosses.dummy run scoreboard players add #count yadventures-bosses.dummy 1
`)
fn('yadventures-bosses:iceologer/strays/summon', `
scoreboard players operation #id yadventures-bosses.dummy = @s yadventures-bosses.id
execute store result score #n yadventures-bosses.dummy run random value 3..4
execute if entity @s[tag=yadventures-bosses.ominous] run scoreboard players set #n yadventures-bosses.dummy 4
function yadventures-bosses:iceologer/strays/summon_loop
# spreadplayers looks for ground below its "under" height: allow a few blocks above the Iceologer
execute store result score #y yadventures-bosses.dummy run data get entity @s Pos[1]
execute store result storage yadventures-bosses:data stray.y int 1 run scoreboard players add #y yadventures-bosses.dummy 3
function yadventures-bosses:iceologer/strays/spread with storage yadventures-bosses:data stray
execute as @e[type=minecraft:stray,tag=yadventures-bosses.new] at @s run function yadventures-bosses:iceologer/strays/init
`)
fn('yadventures-bosses:iceologer/strays/summon_loop', `
summon minecraft:stray ~ ~ ~ {Tags:["yadventures-bosses.iceologer_stray","yadventures-bosses.new"],equipment:{head:{id:"minecraft:leather_helmet",count:1,components:{"minecraft:dyed_color":10539248}}},drop_chances:{head:0f}}
scoreboard players remove #n yadventures-bosses.dummy 1
execute if score #n yadventures-bosses.dummy matches 1.. run function yadventures-bosses:iceologer/strays/summon_loop
`)
fn('yadventures-bosses:iceologer/strays/spread', `
$spreadplayers ~ ~ 1 10 under $(y) false @e[type=minecraft:stray,tag=yadventures-bosses.new,distance=..1]
`)
fn('yadventures-bosses:iceologer/strays/init', `
tag @s remove yadventures-bosses.new
scoreboard players operation @s yadventures-bosses.id = #id yadventures-bosses.dummy
team join yadventures-bosses.illagers @s
particle minecraft:snowflake ~ ~1 ~ 0.3 0.6 0.3 0.05 20
particle minecraft:poof ~ ~1 ~ 0.3 0.5 0.3 0.02 8
`)
fn('yadventures-bosses:iceologer/cast/end', `
scoreboard players set @s yadventures-bosses.cast 0
item modify entity @s armor.chest ${flags([false], 2)}
attribute @s minecraft:movement_speed modifier remove yadventures-bosses:casting
`)

// ---- freezing: mobs get powder snow freezing (TicksFrozen), players (not data-modifiable) an imitation
fn('yadventures-bosses:iceologer/freeze', `
particle minecraft:snowflake ~ ~1 ~ 0.4 0.8 0.4 0.02 20
execute if entity @s[type=minecraft:player] run return run function yadventures-bosses:iceologer/freeze_player
data modify entity @s TicksFrozen set value 400
`)
fn('yadventures-bosses:iceologer/freeze_player', `
execute if items entity @s armor.* #minecraft:freeze_immune_wearables run return fail
# Like TicksFrozen 400 thawing out: fully frozen for 130 ticks, 1 freeze damage every 40 ticks
scoreboard players set @s yadventures-bosses.frozen 130
effect give @s minecraft:slowness 7 2
`)
fn('yadventures-bosses:iceologer/frozen_player', `
scoreboard players remove @s yadventures-bosses.frozen 1
particle minecraft:snowflake ~ ~1 ~ 0.3 0.6 0.3 0 1
scoreboard players operation #m yadventures-bosses.dummy = @s yadventures-bosses.frozen
scoreboard players operation #m yadventures-bosses.dummy %= #40 yadventures-bosses.dummy
execute if score #m yadventures-bosses.dummy matches 0 if score @s yadventures-bosses.frozen matches 1.. run damage @s 1 minecraft:freeze
`)

// ---- ice chunk: appears above the target, follows it for 3-5 s, then falls
fn('yadventures-bosses:ice_chunk/summon', `
# Height above the target: its height squared, at most 6 blocks (in hundredths)
scoreboard players set #off yadventures-bosses.dummy 324
execute if entity @s[type=#yadventures-bosses:villagers] run scoreboard players set #off yadventures-bosses.dummy 380
execute if entity @s[type=minecraft:iron_golem] run scoreboard players set #off yadventures-bosses.dummy 600
execute if entity @s[type=minecraft:glow_squid] run scoreboard players set #off yadventures-bosses.dummy 64
scoreboard players operation #t yadventures-bosses.dummy = @s yadventures-bosses.uid
summon minecraft:item_display ~ ~ ~ {Tags:["yadventures-bosses.ice_chunk","yadventures-bosses.new"],teleport_duration:1,item:{id:"minecraft:stone",count:1,components:{"minecraft:item_model":"yadventures-bosses:ice_chunk"}},transformation:{translation:[0f,0.5f,0f],left_rotation:[0f,0f,0f,1f],scale:[0f,0f,0f],right_rotation:[0f,0f,0f,1f]}}
execute as @e[type=minecraft:item_display,tag=yadventures-bosses.new,distance=..1] run function yadventures-bosses:ice_chunk/init
`)
fn('yadventures-bosses:ice_chunk/init', `
tag @s remove yadventures-bosses.new
scoreboard players operation @s yadventures-bosses.offset = #off yadventures-bosses.dummy
scoreboard players operation @s yadventures-bosses.target = #t yadventures-bosses.dummy
scoreboard players operation @s yadventures-bosses.id = #id yadventures-bosses.dummy
scoreboard players set @s yadventures-bosses.age 0
scoreboard players set @s yadventures-bosses.velocity 0
execute store result score @s yadventures-bosses.timer run random value 60..100
execute store result entity @s Rotation[0] float 1 run random value 0..359
execute store result score #y yadventures-bosses.dummy run data get entity @s Pos[1] 100
scoreboard players operation #y yadventures-bosses.dummy += #off yadventures-bosses.dummy
execute store result entity @s Pos[1] double 0.01 run scoreboard players get #y yadventures-bosses.dummy
`)
fn('yadventures-bosses:ice_chunk/tick', `
scoreboard players add @s yadventures-bosses.age 1
execute if score @s yadventures-bosses.age matches 400.. run return run kill @s
# Grows over 30 ticks
execute if score @s yadventures-bosses.age matches 1 run data merge entity @s {start_interpolation:0,interpolation_duration:30,transformation:{scale:[1f,1f,1f]}}
execute if score @s yadventures-bosses.age matches 10 run playsound yadventures-bosses:entity.ice_chunk.summon hostile @a ~ ~ ~ 1 1
execute if score @s yadventures-bosses.age matches 40 run playsound yadventures-bosses:entity.ice_chunk.ambient hostile @a ~ ~ ~ 1 1
execute if score @s yadventures-bosses.age <= @s yadventures-bosses.timer run return run function yadventures-bosses:ice_chunk/follow
function yadventures-bosses:ice_chunk/fall
`)
fn('yadventures-bosses:ice_chunk/follow', `
function yadventures-bosses:util/tag_target
execute unless entity @e[tag=yadventures-bosses.target,distance=..64] run return run scoreboard players operation @s yadventures-bosses.timer = @s yadventures-bosses.age
execute if entity @e[type=minecraft:player,tag=yadventures-bosses.target,gamemode=!survival,gamemode=!adventure] run return run function yadventures-bosses:ice_chunk/discard
execute at @n[tag=yadventures-bosses.target] run summon minecraft:marker ~ ~ ~ {Tags:["yadventures-bosses.aim"]}
tag @e[tag=yadventures-bosses.target] remove yadventures-bosses.target
execute store result score #y yadventures-bosses.dummy run data get entity @n[type=minecraft:marker,tag=yadventures-bosses.aim] Pos[1] 100
scoreboard players operation #y yadventures-bosses.dummy += @s yadventures-bosses.offset
execute store result entity @n[type=minecraft:marker,tag=yadventures-bosses.aim] Pos[1] double 0.01 run scoreboard players get #y yadventures-bosses.dummy
# 0.2 blocks per tick
execute if entity @n[type=minecraft:marker,tag=yadventures-bosses.aim,distance=..0.2] positioned as @n[type=minecraft:marker,tag=yadventures-bosses.aim] run tp @s ~ ~ ~
execute unless entity @n[type=minecraft:marker,tag=yadventures-bosses.aim,distance=..0.2] facing entity @n[type=minecraft:marker,tag=yadventures-bosses.aim] feet run tp @s ^ ^ ^0.2
kill @e[type=minecraft:marker,tag=yadventures-bosses.aim]
`)
fn('yadventures-bosses:ice_chunk/discard', `
tag @e[tag=yadventures-bosses.target] remove yadventures-bosses.target
kill @s
`)
fn('yadventures-bosses:ice_chunk/fall', `
# Accelerates by 0.05 blocks/tick every tick (#steps steps of 0.05), up to 2 blocks/tick
execute if score @s yadventures-bosses.velocity matches ..39 run scoreboard players add @s yadventures-bosses.velocity 1
scoreboard players operation #steps yadventures-bosses.dummy = @s yadventures-bosses.velocity
function yadventures-bosses:ice_chunk/fall_step
`)
fn('yadventures-bosses:ice_chunk/fall_step', `
execute unless block ~ ~-0.05 ~ #yadventures-bosses:ice_chunk_passable run return run function yadventures-bosses:ice_chunk/land
scoreboard players remove #steps yadventures-bosses.dummy 1
execute if score #steps yadventures-bosses.dummy matches ..0 positioned ~ ~-0.05 ~ run return run tp @s ~ ~ ~
execute positioned ~ ~-0.05 ~ run function yadventures-bosses:ice_chunk/fall_step
`)
fn('yadventures-bosses:ice_chunk/land', `
tp @s ~ ~ ~
playsound yadventures-bosses:entity.ice_chunk.hit hostile @a ~ ~ ~ 1 1
particle minecraft:block{block_state:"minecraft:blue_ice"} ~ ~0.5 ~ 1 0.3 1 0 32
tag @s add yadventures-bosses.this
scoreboard players operation #id yadventures-bosses.dummy = @s yadventures-bosses.id
execute as @e[type=minecraft:wandering_trader,tag=yadventures-bosses.iceologer,tag=!yadventures-bosses.dead] if score @s yadventures-bosses.id = #id yadventures-bosses.dummy run tag @s add yadventures-bosses.owner
# 12 damage in its 2.5x1x2.5 box (+0.2 around), except to illagers
execute positioned ~-1.45 ~ ~-1.45 as @e[dx=1.9,dy=0,dz=1.9,type=!#minecraft:illager,type=!minecraft:armor_stand,tag=!yadventures-bosses.iceologer] if data entity @s Health run function yadventures-bosses:ice_chunk/hit
tag @e[tag=yadventures-bosses.owner] remove yadventures-bosses.owner
kill @s
`)
fn('yadventures-bosses:ice_chunk/hit', `
execute if entity @e[tag=yadventures-bosses.owner] run damage @s 12 minecraft:indirect_magic by @n[type=minecraft:item_display,tag=yadventures-bosses.this] from @n[tag=yadventures-bosses.owner]
execute unless entity @e[tag=yadventures-bosses.owner] run damage @s 12 minecraft:magic
execute if entity @s[type=minecraft:player] run return run function yadventures-bosses:iceologer/freeze_player
data modify entity @s TicksFrozen set value 400
`)
