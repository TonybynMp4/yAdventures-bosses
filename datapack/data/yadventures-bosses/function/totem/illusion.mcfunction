playsound yadventures-bosses:entity.player.mirror_move player @a ~ ~ ~ 1 1
tag @s add yadventures-bosses.this
execute as @e[type=!minecraft:player,distance=..18] run function yadventures-bosses:totem/distract_if_targeting
scoreboard players set #mode yadventures-bosses.dummy 1
function yadventures-bosses:util/start_ring
# Mobs ignore very small repeated damage while hurt-invulnerable, so the decoys "hit" them a bit later
schedule function yadventures-bosses:totem/distract_all 11t replace
tag @s remove yadventures-bosses.this
effect give @s minecraft:invisibility 10 0
