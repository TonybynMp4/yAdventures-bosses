tag @s remove yadventures-bosses.new
scoreboard players operation @s yadventures-bosses.offset = #off yadventures-bosses.dummy
scoreboard players operation @s yadventures-bosses.target = #t yadventures-bosses.dummy
scoreboard players operation @s yadventures-bosses.id = #id yadventures-bosses.dummy
scoreboard players set @s yadventures-bosses.age 0
scoreboard players set @s yadventures-bosses.velocity 0
execute store result score @s yadventures-bosses.timer run random value 60..100
execute store result entity @s Rotation[0] float 1 run random value 0..359
execute store result score #y yadventures-bosses.dummy run data get entity @s Pos[1] 100
scoreboard players operation #y yadventures-bosses.dummy += #off yadventures-bosses.dummy
execute store result entity @s Pos[1] double 0.01 run scoreboard players get #y yadventures-bosses.dummy
