tag @s remove yadventures-bosses.cabin_armor_stand
item replace entity @s armor.head with minecraft:leather_helmet
execute if predicate yadventures-bosses:chance/third run item replace entity @s armor.chest with minecraft:leather_chestplate
execute if predicate yadventures-bosses:chance/third run item replace entity @s armor.legs with minecraft:leather_leggings
execute if predicate yadventures-bosses:chance/third run item replace entity @s armor.feet with minecraft:leather_boots
