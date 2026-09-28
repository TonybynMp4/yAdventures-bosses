particle minecraft:snowflake ~ ~1 ~ 3 1 3 0.05 200
execute as @e[type=!minecraft:player,distance=..9] if data entity @s Health run function yadventures-bosses:totem/freeze_mob
effect give @a[distance=0.01..9,gamemode=!creative,gamemode=!spectator] minecraft:slowness 20 1
effect give @s minecraft:speed 10 1
