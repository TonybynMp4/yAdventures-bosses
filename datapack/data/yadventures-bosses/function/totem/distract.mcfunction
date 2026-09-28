# Blindness does nothing to mobs: make them retaliate against one of the player's illusions instead
scoreboard players operation #id yadventures-bosses.dummy = @s yadventures-bosses.decoy
execute as @e[type=minecraft:mannequin,tag=yadventures-bosses.player_illusion,distance=..32] if score @s yadventures-bosses.id = #id yadventures-bosses.dummy run tag @s add yadventures-bosses.decoy
damage @s 0.01 minecraft:generic by @e[type=minecraft:mannequin,tag=yadventures-bosses.decoy,sort=random,limit=1]
tag @e[type=minecraft:mannequin,tag=yadventures-bosses.decoy] remove yadventures-bosses.decoy
tag @s remove yadventures-bosses.distract
