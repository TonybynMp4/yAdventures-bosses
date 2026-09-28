# Players close enough to be detected soon, who haven't beaten the difficulty they'd start
$tag @a[gamemode=!creative,gamemode=!spectator,distance=..20,tag=!yadventures-bosses.beat.$(id).normal,predicate=!yadventures-bosses:has_omen] add yadventures-bosses.eligible
$tag @a[gamemode=!creative,gamemode=!spectator,distance=..20,tag=!yadventures-bosses.beat.$(id).ominous,predicate=yadventures-bosses:has_omen] add yadventures-bosses.eligible
