$data modify storage yadventures-bosses:data brew.Items append value {Slot:$(slot)b,id:"minecraft:potion",count:1}
data modify storage yadventures-bosses:data brew.Items[-1].components."minecraft:potion_contents".potion set from storage yadventures-bosses:data brew.potion
