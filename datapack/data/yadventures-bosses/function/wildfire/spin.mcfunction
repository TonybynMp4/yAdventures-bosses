# Shields turn 45 degrees every second, interpolated over 20 ticks
scoreboard players operation #step yadventures-bosses.dummy = #gametime yadventures-bosses.dummy
scoreboard players operation #step yadventures-bosses.dummy /= #20 yadventures-bosses.dummy
scoreboard players operation #step yadventures-bosses.dummy %= #8 yadventures-bosses.dummy
execute store result storage yadventures-bosses:data spin.step int 1 run scoreboard players get #step yadventures-bosses.dummy
function yadventures-bosses:wildfire/spin_apply with storage yadventures-bosses:data spin
