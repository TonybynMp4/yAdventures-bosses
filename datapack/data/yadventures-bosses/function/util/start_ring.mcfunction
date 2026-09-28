# Shared setup: new illusion id, random teleport point and ring rotation
scoreboard players add #next yadventures-bosses.id 1
scoreboard players operation @s yadventures-bosses.id = #next yadventures-bosses.id
scoreboard players operation #id yadventures-bosses.dummy = @s yadventures-bosses.id
execute store result score #tp yadventures-bosses.dummy run random value 1..9
execute store result storage yadventures-bosses:data ring.yaw int 1 run random value 0..359
function yadventures-bosses:util/ring with storage yadventures-bosses:data ring
