execute store result storage yadventures-bosses:data shields.count int 1 run scoreboard players get @s yadventures-bosses.shields
execute on passengers if entity @s[tag=yadventures-bosses.wildfire_shields] run function yadventures-bosses:wildfire/set_shield_model with storage yadventures-bosses:data shields
