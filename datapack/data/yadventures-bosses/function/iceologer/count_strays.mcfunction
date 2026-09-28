scoreboard players operation #id yadventures-bosses.dummy = @s yadventures-bosses.id
scoreboard players set #count yadventures-bosses.dummy 0
execute as @e[type=minecraft:stray,tag=yadventures-bosses.iceologer_stray,distance=..64] if score @s yadventures-bosses.id = #id yadventures-bosses.dummy run scoreboard players add #count yadventures-bosses.dummy 1
