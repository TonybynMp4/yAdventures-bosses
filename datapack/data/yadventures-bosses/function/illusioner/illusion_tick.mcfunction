scoreboard players remove @s yadventures-bosses.timer 1
execute if score @s yadventures-bosses.timer matches ..0 run return run function yadventures-bosses:util/vanish
execute if entity @s[nbt={HurtTime:10s}] run return run function yadventures-bosses:util/vanish
# Disappear with the real illusioner
scoreboard players operation #id yadventures-bosses.dummy = @s yadventures-bosses.id
scoreboard players set #ok yadventures-bosses.dummy 0
execute as @e[type=minecraft:illusioner,tag=!yadventures-bosses.illusion,distance=..64] if score @s yadventures-bosses.id = #id yadventures-bosses.dummy run scoreboard players set #ok yadventures-bosses.dummy 1
execute if score #ok yadventures-bosses.dummy matches 0 run function yadventures-bosses:util/vanish
