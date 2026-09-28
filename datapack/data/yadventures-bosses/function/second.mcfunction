execute store result score #difficulty yadventures-bosses.dummy run difficulty

execute as @e[type=minecraft:wandering_trader,tag=yadventures-bosses.iceologer] at @s run function yadventures-bosses:iceologer/second
execute as @a[predicate=yadventures-bosses:wearing_wildfire_crown] run function yadventures-bosses:crown/wearer
execute as @e[tag=yadventures-bosses.leashed] run function yadventures-bosses:spawner/leash

schedule function yadventures-bosses:second 1s replace
