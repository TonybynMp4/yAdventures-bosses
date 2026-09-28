# Random potions for the illusioner shack brewing stands
execute if predicate yadventures-bosses:chance/half run data modify storage yadventures-bosses:data brew set value {Items:[{Slot:3b,id:"minecraft:golden_carrot",count:2}],potion:"minecraft:night_vision"}
execute unless data storage yadventures-bosses:data brew.Items run data modify storage yadventures-bosses:data brew set value {Items:[{Slot:3b,id:"minecraft:fermented_spider_eye",count:1}],potion:"minecraft:invisibility"}
function yadventures-bosses:setup/brewing_stand_potion {slot:1}
execute if predicate yadventures-bosses:chance/half run function yadventures-bosses:setup/brewing_stand_potion {slot:0}
execute if predicate yadventures-bosses:chance/half run function yadventures-bosses:setup/brewing_stand_potion {slot:2}
data modify block ~ ~ ~ Items set from storage yadventures-bosses:data brew.Items
data remove storage yadventures-bosses:data brew
