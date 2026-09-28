# Replace the vanilla mirror spell with real illusions
execute if predicate yadventures-bosses:long_invisibility run effect clear @s minecraft:invisibility
execute if entity @s[tag=yadventures-bosses.illusion] run return run function yadventures-bosses:illusioner/illusion_tick

execute if score @s yadventures-bosses.cooldown matches 1.. run return run scoreboard players remove @s yadventures-bosses.cooldown 1
execute if entity @s[nbt={HurtTime:10s}] run return run function yadventures-bosses:illusioner/hurt
# Also splits as soon as it locks onto a survival player, so the fight opens with illusions
scoreboard players set #ok yadventures-bosses.dummy 0
execute on target if entity @s[type=minecraft:player,gamemode=!creative,gamemode=!spectator,distance=..24] run scoreboard players set #ok yadventures-bosses.dummy 1
execute if score #ok yadventures-bosses.dummy matches 1 run function yadventures-bosses:illusioner/create_illusions
