import { fn } from './lib.ts'

// ============================================================ illusioner
fn('yadventures-bosses:illusioner/tick', `
# Replace the vanilla mirror spell with real illusions
execute if predicate yadventures-bosses:long_invisibility run effect clear @s minecraft:invisibility
execute if entity @s[tag=yadventures-bosses.illusion] run return run function yadventures-bosses:illusioner/illusion_tick

execute if score @s yadventures-bosses.cooldown matches 1.. run return run scoreboard players remove @s yadventures-bosses.cooldown 1
execute if entity @s[nbt={HurtTime:10s}] run return run function yadventures-bosses:illusioner/hurt
# Also splits as soon as it locks onto a survival player, so the fight opens with illusions
scoreboard players set #ok yadventures-bosses.dummy 0
execute on target if entity @s[type=minecraft:player,gamemode=!creative,gamemode=!spectator,distance=..24] run scoreboard players set #ok yadventures-bosses.dummy 1
execute if score #ok yadventures-bosses.dummy matches 1 run function yadventures-bosses:illusioner/create_illusions
`)
fn('yadventures-bosses:illusioner/hurt', `
scoreboard players set #ok yadventures-bosses.dummy 0
execute on attacker unless entity @s[type=#minecraft:illager] unless entity @s[type=minecraft:player,gamemode=creative] run scoreboard players set #ok yadventures-bosses.dummy 1
execute if score #ok yadventures-bosses.dummy matches 1 run function yadventures-bosses:illusioner/create_illusions
`)
fn('yadventures-bosses:illusioner/create_illusions', `
scoreboard players set @s yadventures-bosses.cooldown 600
scoreboard players set @s[tag=yadventures-bosses.ominous] yadventures-bosses.cooldown 300
playsound minecraft:entity.illusioner.mirror_move hostile @a ~ ~ ~ 1 1
particle minecraft:cloud ~ ~1 ~ 0.5 1 0.5 0.05 30
effect give @s minecraft:invisibility 3 0 true
scoreboard players set #mode yadventures-bosses.dummy 0
tag @s add yadventures-bosses.this
function yadventures-bosses:util/start_ring
tag @s remove yadventures-bosses.this
`)
fn('yadventures-bosses:illusioner/summon_illusion', `
summon minecraft:illusioner ~ ~ ~ {Tags:["yadventures-bosses.illusion","yadventures.boss.illusion","yadventures-bosses.new"],DeathLootTable:"yadventures-bosses:entities/empty",equipment:{mainhand:{id:"minecraft:bow",count:1}},drop_chances:{mainhand:0f,offhand:0f,head:0f,chest:0f,legs:0f,feet:0f}}
execute as @e[type=minecraft:illusioner,tag=yadventures-bosses.new,distance=..2] run function yadventures-bosses:illusioner/init_illusion
particle minecraft:cloud ~ ~1 ~ 0.3 0.6 0.3 0.05 16
`)
fn('yadventures-bosses:illusioner/init_illusion', `
tag @s remove yadventures-bosses.new
data modify entity @s Health set from entity @n[type=minecraft:illusioner,tag=yadventures-bosses.this] Health
data modify entity @s Rotation set from entity @n[type=minecraft:illusioner,tag=yadventures-bosses.this] Rotation
scoreboard players operation @s yadventures-bosses.id = #id yadventures-bosses.dummy
scoreboard players set @s yadventures-bosses.timer 600
`)
fn('yadventures-bosses:illusioner/illusion_tick', `
scoreboard players remove @s yadventures-bosses.timer 1
execute if score @s yadventures-bosses.timer matches ..0 run return run function yadventures-bosses:util/vanish
execute if entity @s[nbt={HurtTime:10s}] run return run function yadventures-bosses:util/vanish
# Disappear with the real illusioner
scoreboard players operation #id yadventures-bosses.dummy = @s yadventures-bosses.id
scoreboard players set #ok yadventures-bosses.dummy 0
execute as @e[type=minecraft:illusioner,tag=!yadventures-bosses.illusion,distance=..64] if score @s yadventures-bosses.id = #id yadventures-bosses.dummy run scoreboard players set #ok yadventures-bosses.dummy 1
execute if score #ok yadventures-bosses.dummy matches 0 run function yadventures-bosses:util/vanish
`)
