scoreboard players set #ok yadventures-bosses.dummy 0
execute on attacker unless entity @s[type=#minecraft:illager] unless entity @s[type=minecraft:player,gamemode=creative] run scoreboard players set #ok yadventures-bosses.dummy 1
execute if score #ok yadventures-bosses.dummy matches 1 run function yadventures-bosses:illusioner/create_illusions
