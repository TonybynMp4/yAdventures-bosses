execute unless entity @e[tag=yadventures-bosses.candidate,distance=..16] run return fail
tag @n[tag=yadventures-bosses.candidate,distance=..16] add yadventures-bosses.ray_target
scoreboard players set #los yadventures-bosses.dummy 0
scoreboard players set #steps yadventures-bosses.dummy 0
execute anchored eyes positioned ^ ^ ^ facing entity @n[tag=yadventures-bosses.ray_target] eyes run function yadventures-bosses:util/raycast
execute if score #los yadventures-bosses.dummy matches 1 as @n[tag=yadventures-bosses.ray_target] run function yadventures-bosses:util/uid
execute if score #los yadventures-bosses.dummy matches 1 run scoreboard players operation @s yadventures-bosses.target = #uid yadventures-bosses.dummy
execute if score #los yadventures-bosses.dummy matches 1 run tag @e[tag=yadventures-bosses.candidate] remove yadventures-bosses.candidate
tag @e[tag=yadventures-bosses.ray_target] remove yadventures-bosses.candidate
tag @e[tag=yadventures-bosses.ray_target] remove yadventures-bosses.ray_target
execute if score #los yadventures-bosses.dummy matches 0 run function yadventures-bosses:iceologer/find_target_loop
