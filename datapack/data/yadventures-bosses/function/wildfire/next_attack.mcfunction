# 1-2 barrage, 3-4 shockwave (target within 6) or charge (within 20, else barrage),
# 5 summon (none of its blazes alive, else as 3-4)
execute store result score #r yadventures-bosses.dummy run random value 1..5
function yadventures-bosses:wildfire/count_blazes
execute if score #r yadventures-bosses.dummy matches 5 if score #count yadventures-bosses.dummy matches 0 run return run function yadventures-bosses:wildfire/summon_blazes
execute if score #r yadventures-bosses.dummy matches 3.. if entity @e[tag=yadventures-bosses.target,distance=..6] run return run function yadventures-bosses:wildfire/shockwave/start
execute if score #r yadventures-bosses.dummy matches 3.. if entity @e[tag=yadventures-bosses.target,distance=..20] run return run function yadventures-bosses:wildfire/charge/start
function yadventures-bosses:wildfire/barrage/start
