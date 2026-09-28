execute if entity @s[tag=yadventures-bosses.dead] run return fail
execute if score #difficulty yadventures-bosses.dummy matches 0 run return run function yadventures-bosses:util/vanish
# Just in case something clears it (the milk it drinks in daylight is made harmless in iceologer/tick)
effect give @s minecraft:invisibility infinite 0 true
execute if predicate yadventures-bosses:chance/iceologer_ambient run playsound yadventures-bosses:entity.iceologer.ambient hostile @a ~ ~ ~ 1 1
execute if score @s yadventures-bosses.chunk_cd matches 1.. run scoreboard players remove @s yadventures-bosses.chunk_cd 1
execute if score @s yadventures-bosses.slow_cd matches 1.. run scoreboard players remove @s yadventures-bosses.slow_cd 1
execute if score @s yadventures-bosses.stray_cd matches 1.. run scoreboard players remove @s yadventures-bosses.stray_cd 1

# Keep away from players
execute if entity @a[gamemode=!creative,gamemode=!spectator,distance=..8] run function yadventures-bosses:iceologer/flee
execute unless entity @a[gamemode=!creative,gamemode=!spectator,distance=..8] run function yadventures-bosses:iceologer/stop_fleeing

# Forget targets that are gone, out of follow range or in creative/spectator, then look for a new one
function yadventures-bosses:util/tag_target
execute unless entity @e[tag=yadventures-bosses.target,distance=..18] run scoreboard players reset @s yadventures-bosses.target
execute if entity @e[type=minecraft:player,tag=yadventures-bosses.target,gamemode=!survival,gamemode=!adventure] run scoreboard players reset @s yadventures-bosses.target
tag @e[tag=yadventures-bosses.target] remove yadventures-bosses.target
execute unless score @s yadventures-bosses.target matches 1.. run function yadventures-bosses:iceologer/find_target
execute if score @s yadventures-bosses.cast matches 0 if score @s yadventures-bosses.target matches 1.. run function yadventures-bosses:iceologer/cast/start
