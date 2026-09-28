scoreboard players set #ok yadventures-bosses.dummy 0
execute on target if entity @s[tag=yadventures-bosses.this] run scoreboard players set #ok yadventures-bosses.dummy 1
execute if score #ok yadventures-bosses.dummy matches 0 run return fail
tag @s add yadventures-bosses.distract
scoreboard players operation @s yadventures-bosses.decoy = #id yadventures-bosses.dummy
