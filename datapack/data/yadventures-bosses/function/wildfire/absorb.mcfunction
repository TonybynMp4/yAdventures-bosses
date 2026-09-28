scoreboard players operation #diff yadventures-bosses.dummy = @s yadventures-bosses.health
scoreboard players operation #diff yadventures-bosses.dummy -= #hp yadventures-bosses.dummy
scoreboard players operation @s yadventures-bosses.absorbed += #diff yadventures-bosses.dummy
execute store result entity @s Health float 0.01 run scoreboard players get @s yadventures-bosses.health
execute if score @s yadventures-bosses.absorbed >= @s yadventures-bosses.shield_hp run function yadventures-bosses:wildfire/break_shield
