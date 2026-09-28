scoreboard players add #next yadventures-bosses.id 1
scoreboard players operation @s yadventures-bosses.id = #next yadventures-bosses.id
execute store result score @s yadventures-bosses.health run data get entity @s Health 100
scoreboard players set @s yadventures-bosses.shields 4
scoreboard players set @s yadventures-bosses.absorbed 0
scoreboard players set @s yadventures-bosses.regen 0
scoreboard players set @s yadventures-bosses.state 0
scoreboard players set @s yadventures-bosses.attack_cd 20
