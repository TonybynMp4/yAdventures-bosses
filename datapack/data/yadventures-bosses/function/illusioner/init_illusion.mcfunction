tag @s remove yadventures-bosses.new
data modify entity @s Health set from entity @n[type=minecraft:illusioner,tag=yadventures-bosses.this] Health
data modify entity @s Rotation set from entity @n[type=minecraft:illusioner,tag=yadventures-bosses.this] Rotation
scoreboard players operation @s yadventures-bosses.id = #id yadventures-bosses.dummy
scoreboard players set @s yadventures-bosses.timer 600
