execute store result entity @s Motion[0] double 0.0012 run scoreboard players get @s yadventures-bosses.charge_x
execute store result entity @s Motion[1] double 0.0012 run scoreboard players get @s yadventures-bosses.charge_y
execute store result entity @s Motion[2] double 0.0012 run scoreboard players get @s yadventures-bosses.charge_z
particle minecraft:flame ~ ~1.4 ~ 0.4 0.6 0.4 0.02 10
scoreboard players set #hit yadventures-bosses.dummy 0
execute positioned ~ ~1.4 ~ as @e[distance=..2.2,type=!#yadventures-bosses:wildfire_allies,tag=!yadventures-bosses.wildfire_part] if data entity @s Health run function yadventures-bosses:wildfire/charge/hit
execute if score #hit yadventures-bosses.dummy matches 1 run function yadventures-bosses:wildfire/charge/end
