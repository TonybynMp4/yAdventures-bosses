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
