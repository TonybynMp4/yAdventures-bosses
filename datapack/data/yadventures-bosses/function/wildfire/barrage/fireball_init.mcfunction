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
