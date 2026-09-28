# The wandering trader walks to its wander_target
summon minecraft:marker ~ ~ ~ {Tags:["yadventures-bosses.aim"]}
data modify entity @s wander_target set value [I;0,0,0]
execute store result entity @s wander_target[0] int 1 run data get entity @n[type=minecraft:marker,tag=yadventures-bosses.aim] Pos[0]
execute store result entity @s wander_target[1] int 1 run data get entity @n[type=minecraft:marker,tag=yadventures-bosses.aim] Pos[1]
execute store result entity @s wander_target[2] int 1 run data get entity @n[type=minecraft:marker,tag=yadventures-bosses.aim] Pos[2]
kill @e[type=minecraft:marker,tag=yadventures-bosses.aim,distance=..1]
