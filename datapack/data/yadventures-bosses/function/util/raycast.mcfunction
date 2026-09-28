# Line of sight to yadventures-bosses.ray_target through #yadventures-bosses:see_through blocks (#los = 1 if it's visible)
execute positioned ~-0.5 ~-0.5 ~-0.5 if entity @e[tag=yadventures-bosses.ray_target,dx=0,dy=0,dz=0] run return run scoreboard players set #los yadventures-bosses.dummy 1
execute unless block ~ ~ ~ #yadventures-bosses:see_through run return fail
scoreboard players add #steps yadventures-bosses.dummy 1
execute if score #steps yadventures-bosses.dummy matches ..40 positioned ^ ^ ^0.5 run function yadventures-bosses:util/raycast
