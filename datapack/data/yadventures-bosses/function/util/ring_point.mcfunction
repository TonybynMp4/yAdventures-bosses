scoreboard players add #i yadventures-bosses.dummy 1
scoreboard players set #found yadventures-bosses.dummy 0
scoreboard players set #depth yadventures-bosses.dummy 0
function yadventures-bosses:util/ground_down
scoreboard players set #depth yadventures-bosses.dummy 0
execute if score #found yadventures-bosses.dummy matches 0 positioned ~ ~1 ~ run function yadventures-bosses:util/ground_up
