# Totems of Freezing / Illusion trigger when hurt by an entity at or below half health
advancement revoke @s only yadventures-bosses:technical/totem_hurt
execute store result score #hp yadventures-bosses.dummy run data get entity @s Health 100
execute store result score #max yadventures-bosses.dummy run attribute @s minecraft:max_health get 50
execute unless score #hp yadventures-bosses.dummy matches 1.. run return fail
execute if score #hp yadventures-bosses.dummy > #max yadventures-bosses.dummy run return fail
execute if items entity @s weapon.mainhand *[minecraft:custom_data~{yadventures-bosses:{totem:"freezing"}}] run return run function yadventures-bosses:totem/use {slot:"weapon.mainhand",kind:"freezing"}
execute if items entity @s weapon.mainhand *[minecraft:custom_data~{yadventures-bosses:{totem:"illusion"}}] run return run function yadventures-bosses:totem/use {slot:"weapon.mainhand",kind:"illusion"}
execute if items entity @s weapon.offhand *[minecraft:custom_data~{yadventures-bosses:{totem:"freezing"}}] run return run function yadventures-bosses:totem/use {slot:"weapon.offhand",kind:"freezing"}
execute if items entity @s weapon.offhand *[minecraft:custom_data~{yadventures-bosses:{totem:"illusion"}}] run return run function yadventures-bosses:totem/use {slot:"weapon.offhand",kind:"illusion"}
