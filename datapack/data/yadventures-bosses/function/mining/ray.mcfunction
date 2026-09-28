execute if block ~ ~ ~ #yadventures-bosses:trial_blocks run return 1
execute unless block ~ ~ ~ #yadventures-bosses:ray_through run return 0
scoreboard players remove #steps yadventures-bosses.dummy 1
execute if score #steps yadventures-bosses.dummy matches ..0 run return 0
execute positioned ^ ^ ^0.1 run return run function yadventures-bosses:mining/ray
