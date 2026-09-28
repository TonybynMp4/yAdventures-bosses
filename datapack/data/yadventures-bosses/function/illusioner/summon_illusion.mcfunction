summon minecraft:illusioner ~ ~ ~ {Tags:["yadventures-bosses.illusion","yadventures.boss.illusion","yadventures-bosses.new"],DeathLootTable:"yadventures-bosses:entities/empty",equipment:{mainhand:{id:"minecraft:bow",count:1}},drop_chances:{mainhand:0f,offhand:0f,head:0f,chest:0f,legs:0f,feet:0f}}
execute as @e[type=minecraft:illusioner,tag=yadventures-bosses.new,distance=..2] run function yadventures-bosses:illusioner/init_illusion
particle minecraft:cloud ~ ~1 ~ 0.3 0.6 0.3 0.05 16
