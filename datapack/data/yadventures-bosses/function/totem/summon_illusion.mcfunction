summon minecraft:mannequin ~ ~ ~ {Tags:["yadventures-bosses.player_illusion","yadventures-bosses.new"],hide_description:1b}
execute as @n[type=minecraft:mannequin,tag=yadventures-bosses.new,distance=..2] run function yadventures-bosses:totem/init_illusion
particle minecraft:cloud ~ ~1 ~ 0.3 0.6 0.3 0.05 16
