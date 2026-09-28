# While shields are up, damage is absorbed by them instead of health
execute if score @s yadventures-bosses.shields matches 1.. if score #hp yadventures-bosses.dummy < @s yadventures-bosses.health run function yadventures-bosses:wildfire/absorb
execute if entity @s[nbt={HurtTime:10s}] run function yadventures-bosses:wildfire/hurt
execute if score @s yadventures-bosses.regen matches 1.. run scoreboard players remove @s yadventures-bosses.regen 1
execute if score @s yadventures-bosses.regen matches 0 if score @s yadventures-bosses.shields matches ..3 run function yadventures-bosses:wildfire/regen_shield
execute store result score @s yadventures-bosses.health run data get entity @s Health 100
