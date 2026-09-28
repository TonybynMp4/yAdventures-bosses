import { fn } from './lib.ts'

// ============================================================ totems
fn('yadventures-bosses:totem/hurt', `
# Totems of Freezing / Illusion trigger when hurt by an entity at or below half health
advancement revoke @s only yadventures-bosses:technical/totem_hurt
execute store result score #hp yadventures-bosses.dummy run data get entity @s Health 100
execute store result score #max yadventures-bosses.dummy run attribute @s minecraft:max_health get 50
execute unless score #hp yadventures-bosses.dummy matches 1.. run return fail
execute if score #hp yadventures-bosses.dummy > #max yadventures-bosses.dummy run return fail
execute if items entity @s weapon.mainhand *[minecraft:custom_data~{yadventures-bosses:{totem:"freezing"}}] run return run function yadventures-bosses:totem/use {slot:"weapon.mainhand",kind:"freezing"}
execute if items entity @s weapon.mainhand *[minecraft:custom_data~{yadventures-bosses:{totem:"illusion"}}] run return run function yadventures-bosses:totem/use {slot:"weapon.mainhand",kind:"illusion"}
execute if items entity @s weapon.offhand *[minecraft:custom_data~{yadventures-bosses:{totem:"freezing"}}] run return run function yadventures-bosses:totem/use {slot:"weapon.offhand",kind:"freezing"}
execute if items entity @s weapon.offhand *[minecraft:custom_data~{yadventures-bosses:{totem:"illusion"}}] run return run function yadventures-bosses:totem/use {slot:"weapon.offhand",kind:"illusion"}
`)
fn('yadventures-bosses:totem/use', `
$item modify entity @s $(slot) yadventures-bosses:consume
playsound minecraft:item.totem.use player @a ~ ~ ~ 1 1
particle minecraft:totem_of_undying ~ ~1 ~ 0.4 0.8 0.4 0.5 60
$function yadventures-bosses:totem/$(kind)
`)
fn('yadventures-bosses:totem/freezing', `
particle minecraft:snowflake ~ ~1 ~ 3 1 3 0.05 200
execute as @e[type=!minecraft:player,distance=..9] if data entity @s Health run function yadventures-bosses:totem/freeze_mob
effect give @a[distance=0.01..9,gamemode=!creative,gamemode=!spectator] minecraft:slowness 20 1
effect give @s minecraft:speed 10 1
`)
fn('yadventures-bosses:totem/freeze_mob', `
data modify entity @s TicksFrozen set value 400
effect give @s minecraft:slowness 20 1
`)
fn('yadventures-bosses:totem/illusion', `
playsound yadventures-bosses:entity.player.mirror_move player @a ~ ~ ~ 1 1
tag @s add yadventures-bosses.this
execute as @e[type=!minecraft:player,distance=..18] run function yadventures-bosses:totem/distract_if_targeting
scoreboard players set #mode yadventures-bosses.dummy 1
function yadventures-bosses:util/start_ring
# Mobs ignore very small repeated damage while hurt-invulnerable, so the decoys "hit" them a bit later
schedule function yadventures-bosses:totem/distract_all 11t replace
tag @s remove yadventures-bosses.this
effect give @s minecraft:invisibility 10 0
`)
fn('yadventures-bosses:totem/distract_if_targeting', `
scoreboard players set #ok yadventures-bosses.dummy 0
execute on target if entity @s[tag=yadventures-bosses.this] run scoreboard players set #ok yadventures-bosses.dummy 1
execute if score #ok yadventures-bosses.dummy matches 0 run return fail
tag @s add yadventures-bosses.distract
scoreboard players operation @s yadventures-bosses.decoy = #id yadventures-bosses.dummy
`)
fn('yadventures-bosses:totem/distract_all', `
execute as @e[tag=yadventures-bosses.distract] at @s run function yadventures-bosses:totem/distract
`)
fn('yadventures-bosses:totem/distract', `
# Blindness does nothing to mobs: make them retaliate against one of the player's illusions instead
scoreboard players operation #id yadventures-bosses.dummy = @s yadventures-bosses.decoy
execute as @e[type=minecraft:mannequin,tag=yadventures-bosses.player_illusion,distance=..32] if score @s yadventures-bosses.id = #id yadventures-bosses.dummy run tag @s add yadventures-bosses.decoy
damage @s 0.01 minecraft:generic by @e[type=minecraft:mannequin,tag=yadventures-bosses.decoy,sort=random,limit=1]
tag @e[type=minecraft:mannequin,tag=yadventures-bosses.decoy] remove yadventures-bosses.decoy
tag @s remove yadventures-bosses.distract
`)
fn('yadventures-bosses:totem/summon_illusion', `
summon minecraft:mannequin ~ ~ ~ {Tags:["yadventures-bosses.player_illusion","yadventures-bosses.new"],hide_description:1b}
execute as @n[type=minecraft:mannequin,tag=yadventures-bosses.new,distance=..2] run function yadventures-bosses:totem/init_illusion
particle minecraft:cloud ~ ~1 ~ 0.3 0.6 0.3 0.05 16
`)
fn('yadventures-bosses:totem/init_illusion', `
execute as @p[tag=yadventures-bosses.this] run loot replace entity @n[type=minecraft:mannequin,tag=yadventures-bosses.new] armor.head loot yadventures-bosses:technical/player_head
data modify entity @s profile set from entity @s equipment.head.components."minecraft:profile"
tag @s remove yadventures-bosses.new
item replace entity @s armor.head from entity @p[tag=yadventures-bosses.this] armor.head
item replace entity @s armor.chest from entity @p[tag=yadventures-bosses.this] armor.chest
item replace entity @s armor.legs from entity @p[tag=yadventures-bosses.this] armor.legs
item replace entity @s armor.feet from entity @p[tag=yadventures-bosses.this] armor.feet
item replace entity @s weapon.mainhand from entity @p[tag=yadventures-bosses.this] weapon.mainhand
item replace entity @s weapon.offhand from entity @p[tag=yadventures-bosses.this] weapon.offhand
execute store result storage yadventures-bosses:data ring.yaw int 1 run random value 0..359
function yadventures-bosses:totem/rotate with storage yadventures-bosses:data ring
scoreboard players operation @s yadventures-bosses.id = #id yadventures-bosses.dummy
scoreboard players set @s yadventures-bosses.timer 600
`)
fn('yadventures-bosses:totem/rotate', '$rotate @s $(yaw) 0')
fn('yadventures-bosses:totem/illusion_tick', `
scoreboard players remove @s yadventures-bosses.timer 1
execute if score @s yadventures-bosses.timer matches ..0 run return run function yadventures-bosses:util/vanish
execute if entity @s[nbt={HurtTime:10s}] run function yadventures-bosses:util/vanish
`)