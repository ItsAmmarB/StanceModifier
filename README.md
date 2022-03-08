# StanceModifier (Javascript Edition)

### Credits
> <ins>**JediJosh920**</ins> for the original GTA V [Mod](https://www.gta5-mods.com/scripts/stance) | [[GTA5-Mods](https://www.gta5-mods.com/users/jedijosh920)] <br>
> <ins>**TimothyDexter**</ins> for the original CFX [post](https://forum.cfx.re/t/release-stance-modifier-crouch-and-prone/172038) | [[cfx.re](https://forum.cfx.re/u/timothy_dexter)] [[GitHub](https://github.com/TimothyDexter)] <br>

### Contributors
- [Xseba360](https://github.com/Xseba360)
- [ItsAmmarB](https://github.com/ItsAmmarB)

---

### Features
- Ability to go into stealth, crouch, and prone stance.
- Ability to crawl on stomach and on back.
- Mappable keys for players customizability.
- Mappable keys to each stance directly for fast and quick stance changes.
- Exports for external use. 
- Everything is synchronized.... Everything that works.. is synchronized :p _(refer to the issues section down below)_

---

 ### Installation
Download the latest release, extract the resource from the `.zip`, put the resource in the resources folder, add `start StanceModifier` to your `server.cfg`

---

### Controls & Defauly keybinds
- Next stance = `LCTRL` (_MAPPABLE_)
- Idle (normal) = `SPACE` (_MAPPABLE_)
- Crouch = `UNMAPPED` (_MAPPABLE_)
- Prone = `X` (_MAPPABLE_)
- Prone Flip = `X` (_MAPPABLE_)

- Crawl Forward = `W` (_UNMAPPABLE_)
- Crawl Backward = `S` (_UNMAPPABLE_)
- Crawl Right = `D` (_UNMAPPABLE_)
- Crawl Left = `A` (_UNMAPPABLE_)
- Crawl Aim = `Right Mouse` (_UNMAPPABLE_)

---

### Exports
```js
    exports('GetStance', () => Cached.stance) // Gets the current stance of the ped.
```


```js
    exports('SetStance', Stance => AdvanceStance(Cached.ped, Stance)) // Sets the stance of the ped to the provided stance.
```

### References

```js
    const Stances = { // Types of stances and their corresponding numbers
        Idle: 0,
        Stealth: 1,
        Crouch: 2,
        Prone: {
            Stomach: 3,
            Back: 4
        }
};
```

```js
    const Movements = { // Types of crawl movements and their corresponding numbers
        Forward: 0,
        Backward: 1,
        Left: 2,
        Right: 3
    };
```

```js
    const Controls = {
        Forward: 32, // Move Forward (W)
        Backward: 33, // Move Backward (S)
        Right: 34, // Move Right (D)
        Left: 35, // Move Left (A)
        Aim: 25, // Aim (RIGHT MOUSE)
    };
```

```js
    const Config = {
        FPV: false, // First Person View, 
        FireWhileProne: true,
    }
```

This is a very useful [repository](https://github.com/GTA-Network/GTAVTools/tree/master/GTAVHook) with ton of lists to go through, credits goes to the respective contributors. <br>
happy coding :)

---

### Issues
-	Snipers force 3rd person view due to (SCRIPTED_GUN_TASK_PLANE_WING). [_has not been fixed_]
- Ped will be seen standing up while it's aiming on prone. [Fourthbeam](https://forum.cfx.re/u/fourthbeam/summary)  [_has not been fixed_]

**If you stumbled upon an issue or a bug; make sure to report it by creating an issue card**

---

 > **License:** Do what ever you want just don't claim it's yours, give TimothyDexter, JediJosh920 and Contributors credits for the work.
