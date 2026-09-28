execute unless block ~ ~-0.05 ~ #yadventures-bosses:ice_chunk_passable run return run function yadventures-bosses:ice_chunk/land
scoreboard players remove #steps yadventures-bosses.dummy 1
execute if score #steps yadventures-bosses.dummy matches ..0 positioned ~ ~-0.05 ~ run return run tp @s ~ ~ ~
execute positioned ~ ~-0.05 ~ run function yadventures-bosses:ice_chunk/fall_step
