execute as @p[tag=yadventures-bosses.this] run loot replace entity @n[type=minecraft:mannequin,tag=yadventures-bosses.new] armor.head loot yadventures-bosses:technical/player_head
data modify entity @s profile set from entity @s equipment.head.components."minecraft:profile"
tag @s remove yadventures-bosses.new
item replace entity @s armor.head from entity @p[tag=yadventures-bosses.this] armor.head
item replace entity @s armor.chest from entity @p[tag=yadventures-bosses.this] armor.chest
item replace entity @s armor.legs from entity @p[tag=yadventures-bosses.this] armor.legs
item replace entity @s armor.feet from entity @p[tag=yadventures-bosses.this] armor.feet
item replace entity @s weapon.mainhand from entity @p[tag=yadventures-bosses.this] weapon.mainhand
item replace entity @s weapon.offhand from entity @p[tag=yadventures-bosses.this] weapon.offhand
execute store result storage yadventures-bosses:data ring.yaw int 1 run random value 0..359
function yadventures-bosses:totem/rotate with storage yadventures-bosses:data ring
scoreboard players operation @s yadventures-bosses.id = #id yadventures-bosses.dummy
scoreboard players set @s yadventures-bosses.timer 600
