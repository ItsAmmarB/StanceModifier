# StanceModifier
Stance Modifier (Javascript Edition)

**Credits goes to:** 
1) [JediJosh920](https://www.gta5-mods.com/users/jedijosh920)
2) [TimothyDexter](https://forum.cfx.re/u/timothy_dexter) 

Original CFX [post](https://forum.cfx.re/t/release-stance-modifier-crouch-and-prone/172038) By [TimothyDexter](https://github.com/TimothyDexter)

Original [Mod](https://www.gta5-mods.com/scripts/stance) By [JediJosh920](https://www.gta5-mods.com/users/jedijosh920)

**Open issue card on github or on the cfx post if you have any issues/bugs/improvements.**
- CFX Post: [Link](https://forum.cfx.re/t/stancemodifier-javascript-edition/1000270)

**Usage:**
  - Control.Duck (Ctrl) is used to modify stance.  
  - Holding Ctrl while in Idle, Stealth, or Crouch will immediately transfer to Prone 
  - Control.Sprint (Shift) while prone will toggle between on front and on back
  - Control.Jump (Space) will set the stance state back to Idle
  - States: Idle -> Stealth -> Crouch -> Prone -> Idle

**Issues:**
-	Snipers force 3rd person view due to (SCRIPTED_GUN_TASK_PLANE_WING).
- Ped will be seen standing up while it's aiming on prone/ [Fourthbeam](https://forum.cfx.re/u/fourthbeam/summary)
 
 **Installation:**
drag the script folder to yous server resources folder, then go to `server.cfg` and add ``start StanceModifier``.

 **License:** Do what ever you want just don't claim it's yours, give me, TimothyDexter and JediJosh920 credits for the work.
