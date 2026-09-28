$data modify storage yadventures-bosses:data spin.rotation set from storage yadventures-bosses:data shield_rotation[$(step)]
execute as @e[type=minecraft:item_display,tag=yadventures-bosses.wildfire_shields] run data modify entity @s transformation.left_rotation set from storage yadventures-bosses:data spin.rotation
