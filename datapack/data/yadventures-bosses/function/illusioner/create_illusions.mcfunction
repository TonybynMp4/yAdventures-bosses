scoreboard players set @s yadventures-bosses.cooldown 600
scoreboard players set @s[tag=yadventures-bosses.ominous] yadventures-bosses.cooldown 300
playsound minecraft:entity.illusioner.mirror_move hostile @a ~ ~ ~ 1 1
particle minecraft:cloud ~ ~1 ~ 0.5 1 0.5 0.05 30
effect give @s minecraft:invisibility 3 0 true
scoreboard players set #mode yadventures-bosses.dummy 0
tag @s add yadventures-bosses.this
function yadventures-bosses:util/start_ring
tag @s remove yadventures-bosses.this
