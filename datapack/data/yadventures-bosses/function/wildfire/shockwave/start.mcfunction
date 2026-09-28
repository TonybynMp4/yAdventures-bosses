scoreboard players set @s yadventures-bosses.state 2
scoreboard players set @s yadventures-bosses.timer 0
playsound yadventures-bosses:entity.wildfire.shockwave hostile @a ~ ~ ~ 2 1
execute on passengers if entity @s[tag=yadventures-bosses.wildfire_body] run data merge entity @s {interpolation_duration:18,transformation:{translation:[0f,-1.125f,0f]}}
