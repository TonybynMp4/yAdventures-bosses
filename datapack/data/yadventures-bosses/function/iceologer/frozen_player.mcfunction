scoreboard players remove @s yadventures-bosses.frozen 1
particle minecraft:snowflake ~ ~1 ~ 0.3 0.6 0.3 0 1
scoreboard players operation #m yadventures-bosses.dummy = @s yadventures-bosses.frozen
scoreboard players operation #m yadventures-bosses.dummy %= #40 yadventures-bosses.dummy
execute if score #m yadventures-bosses.dummy matches 0 if score @s yadventures-bosses.frozen matches 1.. run damage @s 1 minecraft:freeze
