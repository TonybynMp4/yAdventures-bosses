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
