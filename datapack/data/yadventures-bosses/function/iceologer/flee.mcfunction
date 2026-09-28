attribute @s minecraft:movement_speed modifier remove yadventures-bosses:flee
attribute @s minecraft:movement_speed modifier add yadventures-bosses:flee 1 add_multiplied_base
execute facing entity @p[gamemode=!creative,gamemode=!spectator,distance=..8] feet rotated ~180 0 positioned ^ ^ ^10 run function yadventures-bosses:iceologer/set_wander_target
