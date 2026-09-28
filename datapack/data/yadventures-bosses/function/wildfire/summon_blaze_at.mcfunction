$summon minecraft:blaze ~$(x) ~1 ~$(z) {Tags:["yadventures-bosses.wildfire_blaze","yadventures-bosses.new"]}
$particle minecraft:flame ~$(x) ~1.5 ~$(z) 0.3 0.6 0.3 0.05 20
execute as @e[type=minecraft:blaze,tag=yadventures-bosses.new,distance=..6] run function yadventures-bosses:wildfire/init_blaze
