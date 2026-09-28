# Tags the entity whose yadventures-bosses.uid is @s's yadventures-bosses.target with yadventures-bosses.target
execute unless score @s yadventures-bosses.target matches 1.. run return fail
scoreboard players operation #t yadventures-bosses.dummy = @s yadventures-bosses.target
execute as @e[scores={yadventures-bosses.uid=1..},distance=..64] if score @s yadventures-bosses.uid = #t yadventures-bosses.dummy run tag @s add yadventures-bosses.target
