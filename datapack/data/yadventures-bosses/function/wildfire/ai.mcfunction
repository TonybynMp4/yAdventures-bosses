execute if score @s yadventures-bosses.state matches 2 run return run function yadventures-bosses:wildfire/shockwave/tick
execute if score @s yadventures-bosses.state matches 3 run return run function yadventures-bosses:wildfire/charge/tick
execute unless entity @e[tag=yadventures-bosses.target,distance=..64] if score @s yadventures-bosses.state matches 1 run return run function yadventures-bosses:wildfire/barrage/stop
execute unless entity @e[tag=yadventures-bosses.target,distance=..64] run return fail
execute if score @s yadventures-bosses.state matches 1 run return run function yadventures-bosses:wildfire/barrage/tick
# One attack at a time: attack ends -> cooldown -> next attack
execute if score @s yadventures-bosses.attack_cd matches 1.. run return run scoreboard players remove @s yadventures-bosses.attack_cd 1
function yadventures-bosses:wildfire/next_attack
