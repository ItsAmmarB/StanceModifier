--[[
StanceModifier (Javascript Edition)
Author: Ammar B. (Discord: Ammar B.#7897)
Release: 2.0.1
Date: 3/8/2020

Credits to:
JediJosh920 (https://www.gta5-mods.com/users/jedijosh920) (https://www.youtube.com/channel/UCmvRF-KB6xCwjHnNgMeUDXw)
TimothyDexter  (https://forum.cfx.re/u/timothy_dexter) 

open issue card on github or on the cfx post if you have any issues/bugs/improvements.

Issues:
  - Snipers force 3rd person view due to (SCRIPTED_GUN_TASK_PLANE_WING).
  - Ped will be seen standing up while aiming whilst prone state, (SCRIPTED_GUN_TASK_PLANE_WING) Animation is not synced with other clients. (Fourthbeam)[https://forum.cfx.re/u/fourthbeam/summary]

 Useful sources:
  - https://github.com/GTA-Network/GTAVTools/blob/master/GTAVHook/GTAV.h


 Commits:
  - Jan 30, 2020 | 1.0.0 | Initial release, credits to TimothyDexter (https://forum.cfx.re/t/release-stance-modifier-crouch-and-prone/172038)
  - Feb 1, 2020 | 1.0.1 | Patch for ProneFlip, now works.
  - Feb 2, 2020 | 1.0.2 | Removed Server.js and the console message
  - Mar 8, 2022 | 2.0.0 | Complete overhual and re-write, many issues and bugs were fixed
  - Mar 30, 2020 | 2.0.1 | yeeted"SetPedMaxMoveBlendRatio()": unneeded
]]
fx_version 'cerulean'

game 'gta5'

name 'StanceModifier'
description 'A custom stance modifier that provide the ability to go into stealth, crouch, and prone stance'
author 'ItsAmmarB'
version '2.0'
url 'https://github.com/ItsAmmarB/StanceModifier'

client_script {
    'client.js'    
}

server_script {
    'server.js'    
}