tag @e[type=minecraft:player,gamemode=!creative,gamemode=!spectator,distance=..16] add yadventures-bosses.candidate
function yadventures-bosses:iceologer/find_target_loop
execute if score @s yadventures-bosses.target matches 1.. run return 1
tag @e[type=#yadventures-bosses:iceologer_targets,type=!minecraft:player,tag=!yadventures-bosses.iceologer,distance=..16] add yadventures-bosses.candidate
function yadventures-bosses:iceologer/find_target_loop
