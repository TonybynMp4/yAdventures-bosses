execute if block ~ ~ ~ #yadventures-bosses:passable if block ~ ~1 ~ #yadventures-bosses:passable unless block ~ ~-1 ~ #yadventures-bosses:passable unless block ~ ~-1 ~ minecraft:lava unless block ~ ~-1 ~ minecraft:water align y run return run function yadventures-bosses:util/ring_action
scoreboard players add #depth yadventures-bosses.dummy 1
execute if score #depth yadventures-bosses.dummy matches ..16 positioned ~ ~-1 ~ run function yadventures-bosses:util/ground_down
