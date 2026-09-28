scoreboard players remove @s yadventures-bosses.shields 1
scoreboard players set @s yadventures-bosses.absorbed 0
playsound yadventures-bosses:entity.wildfire.shield_break hostile @a ~ ~ ~ 1 1
particle minecraft:flame ~ ~1.5 ~ 0.6 0.8 0.6 0.05 40
tag @s add yadventures-bosses.this
execute on attacker run damage @s 8 minecraft:mob_attack by @n[type=minecraft:blaze,tag=yadventures-bosses.this]
tag @s remove yadventures-bosses.this
function yadventures-bosses:wildfire/update_shields
