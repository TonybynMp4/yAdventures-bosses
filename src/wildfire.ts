import { fn, range } from './lib.ts'
import { INVISIBLE } from './iceologer.ts'

// ============================================================ wildfire
const WILDFIRE_PART = (model: string) => `brightness:{sky:15,block:15},item:{id:"minecraft:stone",count:1,components:{"minecraft:item_model":"yadventures-bosses:wildfire/${model}"}},transformation:{translation:[0f,-2.0625f,0f],left_rotation:[0f,0f,0f,1f],scale:[1.5f,1.5f,1.5f],right_rotation:[0f,0f,0f,1f]}`
fn('yadventures-bosses:convert/wildfire', `
# A scaled, invisible blaze carrying item display models
data merge entity @s {CustomName:{"translate":"entity.yadventures-bosses.wildfire"},Silent:1b,PersistenceRequired:1b,DeathLootTable:"yadventures-bosses:entities/wildfire",${INVISIBLE}}
tag @s add yadventures-bosses.wildfire
tag @s add yadventures.boss.wildfire
attribute @s minecraft:scale base set 1.5625
attribute @s minecraft:follow_range base set 32
attribute @s minecraft:movement_speed base set 0.23
attribute @s minecraft:knockback_resistance base set 1
attribute @s minecraft:max_health base set 180
attribute @s minecraft:attack_damage base set 8
attribute @s[tag=yadventures-bosses.ominous] minecraft:attack_damage base set 10
summon minecraft:item_display ~ ~ ~ {Tags:["yadventures-bosses.wildfire_part","yadventures-bosses.wildfire_body","yadventures-bosses.new"],teleport_duration:1,${WILDFIRE_PART('body')}}
summon minecraft:item_display ~ ~ ~ {Tags:["yadventures-bosses.wildfire_part","yadventures-bosses.wildfire_shields","yadventures-bosses.new"],interpolation_duration:20,${WILDFIRE_PART('shields_4')}}
execute as @e[type=minecraft:item_display,tag=yadventures-bosses.new,distance=..1] run ride @s mount @n[type=minecraft:blaze,tag=yadventures-bosses.converting]
tag @e[type=minecraft:item_display,tag=yadventures-bosses.new,distance=..1] remove yadventures-bosses.new
function yadventures-bosses:wildfire/init
`)
fn('yadventures-bosses:wildfire/init', `
scoreboard players add #next yadventures-bosses.id 1
scoreboard players operation @s yadventures-bosses.id = #next yadventures-bosses.id
execute store result score @s yadventures-bosses.health run data get entity @s Health 100
scoreboard players set @s yadventures-bosses.shields 4
scoreboard players set @s yadventures-bosses.absorbed 0
scoreboard players set @s yadventures-bosses.regen 0
scoreboard players set @s yadventures-bosses.state 0
scoreboard players set @s yadventures-bosses.attack_cd 20
scoreboard players set @s yadventures-bosses.wander -40
`)
fn('yadventures-bosses:wildfire/spin', `
# Shields turn 45 degrees every second, interpolated over 20 ticks
scoreboard players operation #step yadventures-bosses.dummy = #gametime yadventures-bosses.dummy
scoreboard players operation #step yadventures-bosses.dummy /= #20 yadventures-bosses.dummy
scoreboard players operation #step yadventures-bosses.dummy %= #8 yadventures-bosses.dummy
execute store result storage yadventures-bosses:data spin.step int 1 run scoreboard players get #step yadventures-bosses.dummy
function yadventures-bosses:wildfire/spin_apply with storage yadventures-bosses:data spin
`)
fn('yadventures-bosses:wildfire/spin_apply', `
$data modify storage yadventures-bosses:data spin.rotation set from storage yadventures-bosses:data shield_rotation[$(step)]
execute as @e[type=minecraft:item_display,tag=yadventures-bosses.wildfire_shields] run data modify entity @s transformation.left_rotation set from storage yadventures-bosses:data spin.rotation
`)
fn('yadventures-bosses:wildfire/tick', `
execute if entity @s[tag=yadventures-bosses.dead] run return fail
execute store result score #hp yadventures-bosses.dummy run data get entity @s Health 100
execute if score #hp yadventures-bosses.dummy matches ..0 run return run function yadventures-bosses:wildfire/death

function yadventures-bosses:wildfire/shields
execute if predicate yadventures-bosses:chance/wildfire_ambient run playsound yadventures-bosses:entity.wildfire.ambient hostile @a ~ ~ ~ 1 1

# Attacks
tag @s add yadventures-bosses.this
execute on target run tag @s add yadventures-bosses.target
# The model faces the target (a hovering blaze never turns its own body), else the blaze's heading
execute unless entity @e[tag=yadventures-bosses.target,distance=..64] rotated as @s on passengers if entity @s[tag=yadventures-bosses.wildfire_body] run rotate @s ~ 0
execute facing entity @n[tag=yadventures-bosses.target,distance=..64] feet on passengers if entity @s[tag=yadventures-bosses.wildfire_body] run rotate @s ~ 0
function yadventures-bosses:wildfire/ai
tag @e[tag=yadventures-bosses.target,distance=..64] remove yadventures-bosses.target
tag @s remove yadventures-bosses.this
`)
fn('yadventures-bosses:wildfire/ai', `
execute if score @s yadventures-bosses.state matches 2 run return run function yadventures-bosses:wildfire/shockwave/tick
execute if score @s yadventures-bosses.state matches 3 run return run function yadventures-bosses:wildfire/charge/tick
execute unless entity @e[tag=yadventures-bosses.target,distance=..64] if score @s yadventures-bosses.state matches 1 run return run function yadventures-bosses:wildfire/barrage/stop
execute if score @s yadventures-bosses.state matches 0 run function yadventures-bosses:wildfire/wander/tick
execute unless entity @e[tag=yadventures-bosses.target,distance=..64] run return fail
execute if score @s yadventures-bosses.state matches 1 run return run function yadventures-bosses:wildfire/barrage/tick
# One attack at a time: attack ends -> cooldown -> next attack
execute if score @s yadventures-bosses.attack_cd matches 1.. run return run scoreboard players remove @s yadventures-bosses.attack_cd 1
function yadventures-bosses:wildfire/next_attack
`)
fn('yadventures-bosses:wildfire/next_attack', `
# 1-2 barrage, 3-4 shockwave (target within 6) or charge (within 20, else barrage),
# 5 summon (none of its blazes alive, else as 3-4)
execute store result score #r yadventures-bosses.dummy run random value 1..5
function yadventures-bosses:wildfire/count_blazes
execute if score #r yadventures-bosses.dummy matches 5 if score #count yadventures-bosses.dummy matches 0 run return run function yadventures-bosses:wildfire/summon_blazes
execute if score #r yadventures-bosses.dummy matches 3.. if entity @e[tag=yadventures-bosses.target,distance=..6] run return run function yadventures-bosses:wildfire/shockwave/start
execute if score #r yadventures-bosses.dummy matches 3.. if entity @e[tag=yadventures-bosses.target,distance=..20] run return run function yadventures-bosses:wildfire/charge/start
function yadventures-bosses:wildfire/barrage/start
`)
fn('yadventures-bosses:wildfire/attack_end', `
scoreboard players set @s yadventures-bosses.state 0
execute store result score @s yadventures-bosses.attack_cd run random value 60..100
execute if entity @s[tag=yadventures-bosses.ominous] store result score @s yadventures-bosses.attack_cd run random value 40..70
`)

// ---- shields
fn('yadventures-bosses:wildfire/shields', `
# While shields are up, damage is absorbed by them instead of health
execute if score @s yadventures-bosses.shields matches 1.. if score #hp yadventures-bosses.dummy < @s yadventures-bosses.health run function yadventures-bosses:wildfire/absorb
execute if entity @s[nbt={HurtTime:10s}] run function yadventures-bosses:wildfire/hurt
execute if score @s yadventures-bosses.regen matches 1.. run scoreboard players remove @s yadventures-bosses.regen 1
execute if score @s yadventures-bosses.regen matches 0 if score @s yadventures-bosses.shields matches ..3 run function yadventures-bosses:wildfire/regen_shield
execute store result score @s yadventures-bosses.health run data get entity @s Health 100
`)
fn('yadventures-bosses:wildfire/absorb', `
scoreboard players operation #diff yadventures-bosses.dummy = @s yadventures-bosses.health
scoreboard players operation #diff yadventures-bosses.dummy -= #hp yadventures-bosses.dummy
scoreboard players operation @s yadventures-bosses.absorbed += #diff yadventures-bosses.dummy
execute store result entity @s Health float 0.01 run scoreboard players get @s yadventures-bosses.health
execute if score @s yadventures-bosses.absorbed >= @s yadventures-bosses.shield_hp run function yadventures-bosses:wildfire/break_shield
`)
fn('yadventures-bosses:wildfire/hurt', `
scoreboard players set @s yadventures-bosses.regen 300
playsound yadventures-bosses:entity.wildfire.hurt hostile @a ~ ~ ~ 1 1
`)
fn('yadventures-bosses:wildfire/break_shield', `
scoreboard players remove @s yadventures-bosses.shields 1
scoreboard players set @s yadventures-bosses.absorbed 0
playsound yadventures-bosses:entity.wildfire.shield_break hostile @a ~ ~ ~ 1 1
particle minecraft:flame ~ ~1.5 ~ 0.6 0.8 0.6 0.05 40
tag @s add yadventures-bosses.this
execute on attacker run damage @s 8 minecraft:mob_attack by @n[type=minecraft:blaze,tag=yadventures-bosses.this]
tag @s remove yadventures-bosses.this
function yadventures-bosses:wildfire/update_shields
`)
fn('yadventures-bosses:wildfire/regen_shield', `
scoreboard players add @s yadventures-bosses.shields 1
scoreboard players set @s yadventures-bosses.regen 300
function yadventures-bosses:wildfire/update_shields
`)
fn('yadventures-bosses:wildfire/update_shields', `
execute store result storage yadventures-bosses:data shields.count int 1 run scoreboard players get @s yadventures-bosses.shields
execute on passengers if entity @s[tag=yadventures-bosses.wildfire_shields] run function yadventures-bosses:wildfire/set_shield_model with storage yadventures-bosses:data shields
`)
fn('yadventures-bosses:wildfire/set_shield_model', `
$data modify entity @s item.components."minecraft:item_model" set value "yadventures-bosses:wildfire/shields_$(count)"
`)
fn('yadventures-bosses:wildfire/owns_fireball', `
execute on origin if entity @s[type=minecraft:blaze,tag=yadventures-bosses.wildfire] run return 1
return fail
`)
fn('yadventures-bosses:wildfire/death', `
tag @s add yadventures-bosses.dead
playsound yadventures-bosses:entity.wildfire.death hostile @a ~ ~ ~ 2 1
particle minecraft:flame ~ ~1.5 ~ 0.7 1 0.7 0.1 80
particle minecraft:large_smoke ~ ~1.5 ~ 0.7 1 0.7 0.05 30
execute on passengers run kill @s
`)

// ---- fireball barrage
fn('yadventures-bosses:wildfire/barrage/start', `
scoreboard players set @s yadventures-bosses.state 1
scoreboard players set @s yadventures-bosses.fired 0
scoreboard players set @s yadventures-bosses.timer 10
`)
fn('yadventures-bosses:wildfire/barrage/stop', `
function yadventures-bosses:wildfire/attack_end
`)
fn('yadventures-bosses:wildfire/barrage/tick', `
execute if score @s yadventures-bosses.fired matches 31.. run return run function yadventures-bosses:wildfire/barrage/stop
scoreboard players add @s yadventures-bosses.timer 1
execute if score @s yadventures-bosses.timer matches 11.. run function yadventures-bosses:wildfire/barrage/volley
`)
fn('yadventures-bosses:wildfire/barrage/volley', [
    'scoreboard players set @s yadventures-bosses.timer 0',
    'scoreboard players add @s yadventures-bosses.fired 8',
    'playsound yadventures-bosses:entity.wildfire.shoot hostile @a ~ ~ ~ 1 1',
    'playsound minecraft:entity.blaze.shoot hostile @a ~ ~ ~ 1 1',
    ...range(8).map(() => 'execute positioned ~ ~1.9 ~ facing entity @e[tag=yadventures-bosses.target,distance=..64,limit=1] eyes run function yadventures-bosses:wildfire/barrage/fireball'),
    '# Melee hit on every other volley when close',
    'scoreboard players operation #v yadventures-bosses.dummy = @s yadventures-bosses.fired',
    'scoreboard players operation #v yadventures-bosses.dummy /= #8 yadventures-bosses.dummy',
    'scoreboard players operation #v yadventures-bosses.dummy %= #2 yadventures-bosses.dummy',
    'execute if score #v yadventures-bosses.dummy matches 0 as @e[tag=yadventures-bosses.target,distance=..3,limit=1] run damage @s 8 minecraft:mob_attack by @n[type=minecraft:blaze,tag=yadventures-bosses.this]',
].join('\n'))
fn('yadventures-bosses:wildfire/barrage/fireball', `
# Random spread (triangular distribution)
execute store result score #a yadventures-bosses.dummy run random value -8..8
execute store result score #b yadventures-bosses.dummy run random value -8..8
execute store result storage yadventures-bosses:data aim.yaw int 1 run scoreboard players operation #a yadventures-bosses.dummy += #b yadventures-bosses.dummy
execute store result score #a yadventures-bosses.dummy run random value -4..4
execute store result score #b yadventures-bosses.dummy run random value -4..4
execute store result storage yadventures-bosses:data aim.pitch int 1 run scoreboard players operation #a yadventures-bosses.dummy += #b yadventures-bosses.dummy
function yadventures-bosses:wildfire/barrage/fireball_aimed with storage yadventures-bosses:data aim
`)
fn('yadventures-bosses:wildfire/barrage/fireball_aimed', `
$execute rotated ~$(yaw) ~$(pitch) run summon minecraft:marker ^ ^ ^1 {Tags:["yadventures-bosses.aim"]}
summon minecraft:small_fireball ~ ~ ~ {Tags:["yadventures-bosses.new","yadventures-bosses.debris"]}
execute as @e[type=minecraft:small_fireball,tag=yadventures-bosses.new,distance=..0.1] run function yadventures-bosses:wildfire/barrage/fireball_init
kill @e[type=minecraft:marker,tag=yadventures-bosses.aim,distance=..2]
`)
fn('yadventures-bosses:wildfire/barrage/fireball_init', `
tag @s remove yadventures-bosses.new
execute store result score #x yadventures-bosses.dummy run data get entity @s Pos[0] 1000
execute store result score #y yadventures-bosses.dummy run data get entity @s Pos[1] 1000
execute store result score #z yadventures-bosses.dummy run data get entity @s Pos[2] 1000
execute store result score #dx yadventures-bosses.dummy run data get entity @n[type=minecraft:marker,tag=yadventures-bosses.aim] Pos[0] 1000
execute store result score #dy yadventures-bosses.dummy run data get entity @n[type=minecraft:marker,tag=yadventures-bosses.aim] Pos[1] 1000
execute store result score #dz yadventures-bosses.dummy run data get entity @n[type=minecraft:marker,tag=yadventures-bosses.aim] Pos[2] 1000
scoreboard players operation #dx yadventures-bosses.dummy -= #x yadventures-bosses.dummy
scoreboard players operation #dy yadventures-bosses.dummy -= #y yadventures-bosses.dummy
scoreboard players operation #dz yadventures-bosses.dummy -= #z yadventures-bosses.dummy
execute store result entity @s Motion[0] double 0.0001 run scoreboard players get #dx yadventures-bosses.dummy
execute store result entity @s Motion[1] double 0.0001 run scoreboard players get #dy yadventures-bosses.dummy
execute store result entity @s Motion[2] double 0.0001 run scoreboard players get #dz yadventures-bosses.dummy
data modify entity @s Owner set from entity @n[type=minecraft:blaze,tag=yadventures-bosses.this] UUID
`)

// ---- shockwave
const BODY = 'on passengers if entity @s[tag=yadventures-bosses.wildfire_body] run data merge entity @s'
fn('yadventures-bosses:wildfire/shockwave/start', `
scoreboard players set @s yadventures-bosses.state 2
scoreboard players set @s yadventures-bosses.timer 0
playsound yadventures-bosses:entity.wildfire.shockwave hostile @a ~ ~ ~ 2 1
execute ${BODY} {interpolation_duration:18,transformation:{translation:[0f,-1.125f,0f]}}
`)
fn('yadventures-bosses:wildfire/shockwave/tick', `
scoreboard players add @s yadventures-bosses.timer 1
execute if score @s yadventures-bosses.timer matches 18 ${BODY} {interpolation_duration:2,transformation:{translation:[0f,-2.25f,0f]}}
execute if score @s yadventures-bosses.timer matches 20 run function yadventures-bosses:wildfire/shockwave/blast
execute if score @s yadventures-bosses.timer matches 20 ${BODY} {interpolation_duration:4,transformation:{translation:[0f,-2.0625f,0f]}}
execute if score @s yadventures-bosses.timer matches 24.. run function yadventures-bosses:wildfire/shockwave/end
`)
// It hovers (and a charge can end in mid-air), so the blast hits the ground below it: up to 8 blocks down
fn('yadventures-bosses:wildfire/shockwave/blast', `
scoreboard players set #depth yadventures-bosses.dummy 0
function yadventures-bosses:wildfire/shockwave/ground
`)
fn('yadventures-bosses:wildfire/shockwave/ground', `
execute unless block ~ ~-0.5 ~ #yadventures-bosses:passable run return run function yadventures-bosses:wildfire/shockwave/hit
scoreboard players add #depth yadventures-bosses.dummy 1
execute if score #depth yadventures-bosses.dummy matches 8.. run return run function yadventures-bosses:wildfire/shockwave/hit
execute positioned ~ ~-1 ~ run function yadventures-bosses:wildfire/shockwave/ground
`)
fn('yadventures-bosses:wildfire/shockwave/hit', `
execute as @e[distance=..7,type=!#yadventures-bosses:wildfire_allies,tag=!yadventures-bosses.wildfire_part] if data entity @s Health run damage @s 16 minecraft:mob_attack by @n[type=minecraft:blaze,tag=yadventures-bosses.this]
function yadventures-bosses:wildfire/shockwave/particles
particle minecraft:explosion ~ ~0.5 ~ 1 0.2 1 0 4 force
playsound minecraft:entity.generic.explode hostile @a ~ ~ ~ 1 1.2
`)
const lines: string[] = []
for (const i of range(48)) {
  const a = 2 * Math.PI * i / 48
  const c = Math.cos(a), s = Math.sin(a)
  for (const speed of [0.25, 0.4]) {
    lines.push(`particle minecraft:flame ~${(c * 0.5).toFixed(3)} ~0.2 ~${(s * 0.5).toFixed(3)} ${c.toFixed(3)} 0 ${s.toFixed(3)} ${speed} 0 force`)
  }
}
fn('yadventures-bosses:wildfire/shockwave/particles', lines.join('\n'))
fn('yadventures-bosses:wildfire/shockwave/end', `
function yadventures-bosses:wildfire/attack_end
`)

// ---- charge: 15-tick windup, then a straight dash (1.2 blocks/tick, up to 15 ticks) at where the target was,
// hitting everything it touches once and stopping there, followed by a shockwave
fn('yadventures-bosses:wildfire/charge/start', `
scoreboard players set @s yadventures-bosses.state 3
scoreboard players set @s yadventures-bosses.timer 0
playsound minecraft:entity.blaze.ambient hostile @a ~ ~ ~ 2 0.5
`)
fn('yadventures-bosses:wildfire/charge/tick', `
scoreboard players add @s yadventures-bosses.timer 1
execute if score @s yadventures-bosses.timer matches ..15 run particle minecraft:flame ~ ~0.3 ~ 0.5 0.2 0.5 0.02 6
execute if score @s yadventures-bosses.timer matches 16 run function yadventures-bosses:wildfire/charge/aim
execute if score @s yadventures-bosses.timer matches 16.. run function yadventures-bosses:wildfire/charge/dash
execute if score @s yadventures-bosses.timer matches 31.. run function yadventures-bosses:wildfire/charge/end
`)
fn('yadventures-bosses:wildfire/charge/aim', `
playsound minecraft:item.firecharge.use hostile @a ~ ~ ~ 2 0.6
scoreboard players set @s yadventures-bosses.charge_x 0
scoreboard players set @s yadventures-bosses.charge_y 0
scoreboard players set @s yadventures-bosses.charge_z 0
execute positioned ~ ~1.4 ~ facing entity @n[tag=yadventures-bosses.target,distance=..64] eyes run summon minecraft:marker ^ ^ ^1 {Tags:["yadventures-bosses.aim"]}
execute unless entity @n[type=minecraft:marker,tag=yadventures-bosses.aim,distance=..3] run return fail
execute store result score @s yadventures-bosses.charge_x run data get entity @n[type=minecraft:marker,tag=yadventures-bosses.aim,distance=..3] Pos[0] 1000
execute store result score @s yadventures-bosses.charge_y run data get entity @n[type=minecraft:marker,tag=yadventures-bosses.aim,distance=..3] Pos[1] 1000
execute store result score @s yadventures-bosses.charge_z run data get entity @n[type=minecraft:marker,tag=yadventures-bosses.aim,distance=..3] Pos[2] 1000
kill @e[type=minecraft:marker,tag=yadventures-bosses.aim,distance=..3]
execute store result score #x yadventures-bosses.dummy run data get entity @s Pos[0] 1000
execute store result score #y yadventures-bosses.dummy run data get entity @s Pos[1] 1000
execute store result score #z yadventures-bosses.dummy run data get entity @s Pos[2] 1000
scoreboard players add #y yadventures-bosses.dummy 1400
scoreboard players operation @s yadventures-bosses.charge_x -= #x yadventures-bosses.dummy
scoreboard players operation @s yadventures-bosses.charge_y -= #y yadventures-bosses.dummy
scoreboard players operation @s yadventures-bosses.charge_z -= #z yadventures-bosses.dummy
`)
fn('yadventures-bosses:wildfire/charge/dash', `
execute store result entity @s Motion[0] double 0.0012 run scoreboard players get @s yadventures-bosses.charge_x
execute store result entity @s Motion[1] double 0.0012 run scoreboard players get @s yadventures-bosses.charge_y
execute store result entity @s Motion[2] double 0.0012 run scoreboard players get @s yadventures-bosses.charge_z
particle minecraft:flame ~ ~1.4 ~ 0.4 0.6 0.4 0.02 10
scoreboard players set #hit yadventures-bosses.dummy 0
execute positioned ~ ~1.4 ~ as @e[distance=..2.2,type=!#yadventures-bosses:wildfire_allies,tag=!yadventures-bosses.wildfire_part] if data entity @s Health run function yadventures-bosses:wildfire/charge/hit
execute if score #hit yadventures-bosses.dummy matches 1 run function yadventures-bosses:wildfire/charge/end
`)
fn('yadventures-bosses:wildfire/charge/hit', `
damage @s 20 minecraft:mob_attack by @n[type=minecraft:blaze,tag=yadventures-bosses.this]
scoreboard players set #hit yadventures-bosses.dummy 1
`)
fn('yadventures-bosses:wildfire/charge/end', `
data modify entity @s Motion set value [0d,0d,0d]
execute if score #hit yadventures-bosses.dummy matches 1 run playsound minecraft:entity.generic.explode hostile @a ~ ~ ~ 0.6 1.6
function yadventures-bosses:wildfire/shockwave/start
`)

// ---- summon blazes
fn('yadventures-bosses:wildfire/count_blazes', `
scoreboard players operation #id yadventures-bosses.dummy = @s yadventures-bosses.id
scoreboard players set #count yadventures-bosses.dummy 0
execute as @e[type=minecraft:blaze,tag=yadventures-bosses.wildfire_blaze,distance=..64] if score @s yadventures-bosses.id = #id yadventures-bosses.dummy run scoreboard players add #count yadventures-bosses.dummy 1
`)
fn('yadventures-bosses:wildfire/summon_blazes', `
# Only called while none of its blazes are alive: 1-2 new ones
playsound yadventures-bosses:entity.wildfire.summon_blaze hostile @a ~ ~ ~ 1 1
function yadventures-bosses:wildfire/summon_blaze
execute if predicate yadventures-bosses:chance/half run function yadventures-bosses:wildfire/summon_blaze
function yadventures-bosses:wildfire/attack_end
`)
fn('yadventures-bosses:wildfire/summon_blaze', `
execute store result storage yadventures-bosses:data blaze.x int 1 run random value -2..2
execute store result storage yadventures-bosses:data blaze.z int 1 run random value -2..2
function yadventures-bosses:wildfire/summon_blaze_at with storage yadventures-bosses:data blaze
`)
fn('yadventures-bosses:wildfire/summon_blaze_at', `
$summon minecraft:blaze ~$(x) ~1 ~$(z) {Tags:["yadventures-bosses.wildfire_blaze","yadventures-bosses.new"]}
$particle minecraft:flame ~$(x) ~1.5 ~$(z) 0.3 0.6 0.3 0.05 20
execute as @e[type=minecraft:blaze,tag=yadventures-bosses.new,distance=..6] run function yadventures-bosses:wildfire/init_blaze
`)
fn('yadventures-bosses:wildfire/init_blaze', `
tag @s remove yadventures-bosses.new
scoreboard players operation @s yadventures-bosses.id = #id yadventures-bosses.dummy
`)
// ---- wander: between attacks (and without a target) it drifts in a straight line for 1-2 s at 0.1 blocks/tick,
// then pauses 1.5-4 s. A Wildfire from a spawner heads back when it's more than 6 blocks from its spawn point.
// (The vanilla blaze only strolls without a target, and rarely.)
fn('yadventures-bosses:wildfire/wander/tick', `
execute if score @s yadventures-bosses.wander matches ..-1 run return run scoreboard players add @s yadventures-bosses.wander 1
execute if score @s yadventures-bosses.wander matches 0 run return run function yadventures-bosses:wildfire/wander/start
execute store result entity @s Motion[0] double 0.0001 run scoreboard players get @s yadventures-bosses.wander_x
execute store result entity @s Motion[2] double 0.0001 run scoreboard players get @s yadventures-bosses.wander_z
scoreboard players remove @s yadventures-bosses.wander 1
execute if score @s yadventures-bosses.wander matches 0 store result score @s yadventures-bosses.wander run random value -80..-30
`)
fn('yadventures-bosses:wildfire/wander/start', `
execute store result storage yadventures-bosses:data wander.yaw int 1 run random value 0..359
execute store result storage yadventures-bosses:data wander.x int 1 run scoreboard players get @s yadventures-bosses.home_x
execute store result storage yadventures-bosses:data wander.z int 1 run scoreboard players get @s yadventures-bosses.home_z
execute store result storage yadventures-bosses:data wander.y int 1 run scoreboard players get @s yadventures-bosses.home_y
scoreboard players set #home yadventures-bosses.dummy 0
execute if entity @s[tag=yadventures-bosses.leashed] run function yadventures-bosses:wildfire/wander/far_from_home with storage yadventures-bosses:data wander
execute if score #home yadventures-bosses.dummy matches 0 run function yadventures-bosses:wildfire/wander/aim with storage yadventures-bosses:data wander
execute if score #home yadventures-bosses.dummy matches 1 run function yadventures-bosses:wildfire/wander/aim_home with storage yadventures-bosses:data wander
execute store result score @s yadventures-bosses.wander_x run data get entity @n[type=minecraft:marker,tag=yadventures-bosses.aim,distance=..2] Pos[0] 1000
execute store result score @s yadventures-bosses.wander_z run data get entity @n[type=minecraft:marker,tag=yadventures-bosses.aim,distance=..2] Pos[2] 1000
kill @e[type=minecraft:marker,tag=yadventures-bosses.aim,distance=..2]
execute store result score #x yadventures-bosses.dummy run data get entity @s Pos[0] 1000
execute store result score #z yadventures-bosses.dummy run data get entity @s Pos[2] 1000
scoreboard players operation @s yadventures-bosses.wander_x -= #x yadventures-bosses.dummy
scoreboard players operation @s yadventures-bosses.wander_z -= #z yadventures-bosses.dummy
execute store result score @s yadventures-bosses.wander run random value 20..40
`)
fn('yadventures-bosses:wildfire/wander/far_from_home', `
$execute unless entity @s[x=$(x),y=$(y),z=$(z),distance=..6] run scoreboard players set #home yadventures-bosses.dummy 1
`)
fn('yadventures-bosses:wildfire/wander/aim', `
$execute rotated $(yaw) 0 run summon minecraft:marker ^ ^ ^1 {Tags:["yadventures-bosses.aim"]}
`)
fn('yadventures-bosses:wildfire/wander/aim_home', `
$execute facing $(x) ~ $(z) run summon minecraft:marker ^ ^ ^1 {Tags:["yadventures-bosses.aim"]}
`)
