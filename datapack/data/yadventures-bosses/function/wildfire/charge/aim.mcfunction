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
