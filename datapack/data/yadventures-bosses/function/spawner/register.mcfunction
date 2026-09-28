execute if entity @e[type=minecraft:marker,tag=yadventures-bosses.spawner,distance=..0.1] run return 1
summon minecraft:marker ~ ~ ~ {Tags:["yadventures-bosses.spawner"]}
scoreboard players add #next yadventures-bosses.id 1
scoreboard players operation @n[type=minecraft:marker,tag=yadventures-bosses.spawner,distance=..0.1] yadventures-bosses.id = #next yadventures-bosses.id
data modify block ~ ~ ~ target_cooldown_length set value 1200
