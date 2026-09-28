execute if items entity @s armor.* #minecraft:freeze_immune_wearables run return fail
# Like TicksFrozen 400 thawing out: fully frozen for 130 ticks, 1 freeze damage every 40 ticks
scoreboard players set @s yadventures-bosses.frozen 130
effect give @s minecraft:slowness 7 2
