summon minecraft:stray ~ ~ ~ {Tags:["yadventures-bosses.iceologer_stray","yadventures-bosses.new"],equipment:{head:{id:"minecraft:leather_helmet",count:1,components:{"minecraft:dyed_color":10539248}}},drop_chances:{head:0f}}
scoreboard players remove #n yadventures-bosses.dummy 1
execute if score #n yadventures-bosses.dummy matches 1.. run function yadventures-bosses:iceologer/strays/summon_loop
