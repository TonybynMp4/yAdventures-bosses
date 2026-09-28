execute as @e[distance=..7,type=!#yadventures-bosses:wildfire_allies,tag=!yadventures-bosses.wildfire_part] if data entity @s Health run damage @s 8 minecraft:mob_attack by @n[type=minecraft:blaze,tag=yadventures-bosses.this]
function yadventures-bosses:wildfire/shockwave/particles
playsound minecraft:entity.generic.explode hostile @a ~ ~ ~ 0.6 1.4
