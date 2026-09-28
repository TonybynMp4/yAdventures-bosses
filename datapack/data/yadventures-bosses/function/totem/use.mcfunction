$item modify entity @s $(slot) yadventures-bosses:consume
playsound minecraft:item.totem.use player @a ~ ~ ~ 1 1
particle minecraft:totem_of_undying ~ ~1 ~ 0.4 0.8 0.4 0.5 60
$function yadventures-bosses:totem/$(kind)
