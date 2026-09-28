playsound yadventures-bosses:entity.iceologer.hurt hostile @a ~ ~ ~ 1 1
# Retaliate against whoever hurt it (except illagers and creative players)
scoreboard players set #uid yadventures-bosses.dummy 0
execute on attacker unless entity @s[type=#minecraft:illager] unless entity @s[tag=yadventures-bosses.iceologer] unless entity @s[type=minecraft:player,gamemode=creative] run function yadventures-bosses:util/uid
execute if score #uid yadventures-bosses.dummy matches 1.. run scoreboard players operation @s yadventures-bosses.target = #uid yadventures-bosses.dummy
