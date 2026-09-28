scoreboard players add @s yadventures-bosses.timer 1
execute if score @s yadventures-bosses.timer matches 18 on passengers if entity @s[tag=yadventures-bosses.wildfire_body] run data merge entity @s {interpolation_duration:2,transformation:{translation:[0f,-2.25f,0f]}}
execute if score @s yadventures-bosses.timer matches 20 run function yadventures-bosses:wildfire/shockwave/blast
execute if score @s yadventures-bosses.timer matches 20 on passengers if entity @s[tag=yadventures-bosses.wildfire_body] run data merge entity @s {interpolation_duration:4,transformation:{translation:[0f,-2.0625f,0f]}}
execute if score @s yadventures-bosses.timer matches 24.. run function yadventures-bosses:wildfire/shockwave/end
