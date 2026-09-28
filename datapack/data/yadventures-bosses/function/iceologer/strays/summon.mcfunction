scoreboard players operation #id yadventures-bosses.dummy = @s yadventures-bosses.id
execute store result score #n yadventures-bosses.dummy run random value 3..4
execute if entity @s[tag=yadventures-bosses.ominous] run scoreboard players set #n yadventures-bosses.dummy 4
function yadventures-bosses:iceologer/strays/summon_loop
# spreadplayers looks for ground below its "under" height: allow a few blocks above the Iceologer
execute store result score #y yadventures-bosses.dummy run data get entity @s Pos[1]
execute store result storage yadventures-bosses:data stray.y int 1 run scoreboard players add #y yadventures-bosses.dummy 3
function yadventures-bosses:iceologer/strays/spread with storage yadventures-bosses:data stray
execute as @e[type=minecraft:stray,tag=yadventures-bosses.new] at @s run function yadventures-bosses:iceologer/strays/init
