execute if score @s yadventures-bosses.fired matches 31.. run return run function yadventures-bosses:wildfire/barrage/stop
scoreboard players add @s yadventures-bosses.timer 1
execute if score @s yadventures-bosses.timer matches 11.. run function yadventures-bosses:wildfire/barrage/volley
