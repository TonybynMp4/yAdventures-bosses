# Random spread (triangular distribution)
execute store result score #a yadventures-bosses.dummy run random value -8..8
execute store result score #b yadventures-bosses.dummy run random value -8..8
execute store result storage yadventures-bosses:data aim.yaw int 1 run scoreboard players operation #a yadventures-bosses.dummy += #b yadventures-bosses.dummy
execute store result score #a yadventures-bosses.dummy run random value -4..4
execute store result score #b yadventures-bosses.dummy run random value -4..4
execute store result storage yadventures-bosses:data aim.pitch int 1 run scoreboard players operation #a yadventures-bosses.dummy += #b yadventures-bosses.dummy
function yadventures-bosses:wildfire/barrage/fireball_aimed with storage yadventures-bosses:data aim
