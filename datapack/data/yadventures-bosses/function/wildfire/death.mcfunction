tag @s add yadventures-bosses.dead
playsound yadventures-bosses:entity.wildfire.death hostile @a ~ ~ ~ 2 1
particle minecraft:flame ~ ~1.5 ~ 0.7 1 0.7 0.1 80
particle minecraft:large_smoke ~ ~1.5 ~ 0.7 1 0.7 0.05 30
execute on passengers run kill @s
