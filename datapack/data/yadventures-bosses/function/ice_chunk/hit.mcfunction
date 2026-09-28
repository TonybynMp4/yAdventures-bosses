execute if entity @e[tag=yadventures-bosses.owner] run damage @s 12 minecraft:indirect_magic by @n[type=minecraft:item_display,tag=yadventures-bosses.this] from @n[tag=yadventures-bosses.owner]
execute unless entity @e[tag=yadventures-bosses.owner] run damage @s 12 minecraft:magic
execute if entity @s[type=minecraft:player] run return run function yadventures-bosses:iceologer/freeze_player
data modify entity @s TicksFrozen set value 400
