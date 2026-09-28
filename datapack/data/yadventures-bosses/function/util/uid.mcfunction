# Gives @s a permanent target id and puts it in #uid
execute unless score @s yadventures-bosses.uid matches 1.. run scoreboard players add #next yadventures-bosses.uid 1
execute unless score @s yadventures-bosses.uid matches 1.. run scoreboard players operation @s yadventures-bosses.uid = #next yadventures-bosses.uid
scoreboard players operation #uid yadventures-bosses.dummy = @s yadventures-bosses.uid
