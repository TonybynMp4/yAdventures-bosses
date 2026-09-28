tag @s remove yadventures-bosses.convert
tag @s add yadventures-bosses.converting
execute if entity @s[tag=yadventures-bosses.convert.iceologer] run function yadventures-bosses:convert/iceologer
execute if entity @s[tag=yadventures-bosses.convert.illusioner] run function yadventures-bosses:convert/illusioner
execute if entity @s[tag=yadventures-bosses.convert.wildfire] run function yadventures-bosses:convert/wildfire
# Health: x1.5 when ominous, then x0.5 on easy and x1.5 on hard
execute store result score #difficulty yadventures-bosses.dummy run difficulty
attribute @s[tag=yadventures-bosses.ominous] minecraft:max_health modifier add yadventures-bosses:ominous 0.5 add_multiplied_total
execute if score #difficulty yadventures-bosses.dummy matches 1 run attribute @s minecraft:max_health modifier add yadventures-bosses:difficulty -0.5 add_multiplied_total
execute if score #difficulty yadventures-bosses.dummy matches 3 run attribute @s minecraft:max_health modifier add yadventures-bosses:difficulty 0.5 add_multiplied_total
execute store result entity @s Health float 1 run attribute @s minecraft:max_health get
# A Wildfire shield breaks after absorbing a quarter of the max health
execute if entity @s[tag=yadventures-bosses.wildfire] store result score @s yadventures-bosses.shield_hp run attribute @s minecraft:max_health get 25
execute if entity @s[tag=yadventures-bosses.from_spawner] run function yadventures-bosses:spawner/set_home
execute if entity @s[tag=yadventures-bosses.from_spawner] align xyz positioned ~0.5 ~0.5 ~0.5 run function yadventures-bosses:spawner/find
tag @s remove yadventures-bosses.converting
