scoreboard players remove @s yadventures-bosses.timer 1
execute if score @s yadventures-bosses.timer matches ..0 run return run function yadventures-bosses:util/vanish
execute if entity @s[nbt={HurtTime:10s}] run function yadventures-bosses:util/vanish
