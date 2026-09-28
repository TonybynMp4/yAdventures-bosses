particle minecraft:snowflake ~ ~1 ~ 0.4 0.8 0.4 0.02 20
execute if entity @s[type=minecraft:player] run return run function yadventures-bosses:iceologer/freeze_player
data modify entity @s TicksFrozen set value 400
