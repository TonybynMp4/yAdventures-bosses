scoreboard players add @s yadventures-bosses.timer 1
execute if score @s yadventures-bosses.timer matches ..15 run particle minecraft:flame ~ ~0.3 ~ 0.5 0.2 0.5 0.02 6
execute if score @s yadventures-bosses.timer matches 16 run function yadventures-bosses:wildfire/charge/aim
execute if score @s yadventures-bosses.timer matches 16.. run function yadventures-bosses:wildfire/charge/dash
execute if score @s yadventures-bosses.timer matches 31.. run function yadventures-bosses:wildfire/charge/end
