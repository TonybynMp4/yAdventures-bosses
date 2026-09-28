$execute rotated ~$(yaw) ~$(pitch) run summon minecraft:marker ^ ^ ^1 {Tags:["yadventures-bosses.aim"]}
summon minecraft:small_fireball ~ ~ ~ {Tags:["yadventures-bosses.new","yadventures-bosses.debris"]}
execute as @e[type=minecraft:small_fireball,tag=yadventures-bosses.new,distance=..0.1] run function yadventures-bosses:wildfire/barrage/fireball_init
kill @e[type=minecraft:marker,tag=yadventures-bosses.aim,distance=..2]
