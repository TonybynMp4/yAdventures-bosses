scoreboard players add @s yadventures-bosses.age 1
execute if score @s yadventures-bosses.age matches 400.. run return run kill @s
# Grows over 30 ticks
execute if score @s yadventures-bosses.age matches 1 run data merge entity @s {start_interpolation:0,interpolation_duration:30,transformation:{scale:[1f,1f,1f]}}
execute if score @s yadventures-bosses.age matches 10 run playsound yadventures-bosses:entity.ice_chunk.summon hostile @a ~ ~ ~ 1 1
execute if score @s yadventures-bosses.age matches 40 run playsound yadventures-bosses:entity.ice_chunk.ambient hostile @a ~ ~ ~ 1 1
execute if score @s yadventures-bosses.age <= @s yadventures-bosses.timer run return run function yadventures-bosses:ice_chunk/follow
function yadventures-bosses:ice_chunk/fall
