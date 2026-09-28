scoreboard players set @s yadventures-bosses.timer 0
scoreboard players add @s yadventures-bosses.fired 8
playsound yadventures-bosses:entity.wildfire.shoot hostile @a ~ ~ ~ 1 1
playsound minecraft:entity.blaze.shoot hostile @a ~ ~ ~ 1 1
execute positioned ~ ~1.9 ~ facing entity @e[tag=yadventures-bosses.target,distance=..64,limit=1] eyes run function yadventures-bosses:wildfire/barrage/fireball
execute positioned ~ ~1.9 ~ facing entity @e[tag=yadventures-bosses.target,distance=..64,limit=1] eyes run function yadventures-bosses:wildfire/barrage/fireball
execute positioned ~ ~1.9 ~ facing entity @e[tag=yadventures-bosses.target,distance=..64,limit=1] eyes run function yadventures-bosses:wildfire/barrage/fireball
execute positioned ~ ~1.9 ~ facing entity @e[tag=yadventures-bosses.target,distance=..64,limit=1] eyes run function yadventures-bosses:wildfire/barrage/fireball
execute positioned ~ ~1.9 ~ facing entity @e[tag=yadventures-bosses.target,distance=..64,limit=1] eyes run function yadventures-bosses:wildfire/barrage/fireball
execute positioned ~ ~1.9 ~ facing entity @e[tag=yadventures-bosses.target,distance=..64,limit=1] eyes run function yadventures-bosses:wildfire/barrage/fireball
execute positioned ~ ~1.9 ~ facing entity @e[tag=yadventures-bosses.target,distance=..64,limit=1] eyes run function yadventures-bosses:wildfire/barrage/fireball
execute positioned ~ ~1.9 ~ facing entity @e[tag=yadventures-bosses.target,distance=..64,limit=1] eyes run function yadventures-bosses:wildfire/barrage/fireball
# Melee hit on every other volley when close
scoreboard players operation #v yadventures-bosses.dummy = @s yadventures-bosses.fired
scoreboard players operation #v yadventures-bosses.dummy /= #8 yadventures-bosses.dummy
scoreboard players operation #v yadventures-bosses.dummy %= #2 yadventures-bosses.dummy
execute if score #v yadventures-bosses.dummy matches 0 as @e[tag=yadventures-bosses.target,distance=..3,limit=1] run damage @s 8 minecraft:mob_attack by @n[type=minecraft:blaze,tag=yadventures-bosses.this]
