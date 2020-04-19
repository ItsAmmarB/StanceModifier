/**
 * Stance Modifier (Javascript edition)
 * Author: Ammar B. (Discord: Ammar B.#5160)
 * Release: 1.0.1
 * Date: 30/1/2020
 * 
 * Credits to:
 * JediJosh920 (https://www.gta5-mods.com/users/jedijosh920) (https://www.youtube.com/channel/UCmvRF-KB6xCwjHnNgMeUDXw)
 * TimothyDexter  (https://forum.cfx.re/u/timothy_dexter) 
 * 
 * Original CFX post (https://forum.cfx.re/t/release-stance-modifier-crouch-and-prone/172038) By TimothyDexter (https://forum.cfx.re/t/release-stance-modifier-crouch-and-prone/172038)
 * 
 * 
 * DM me on discord or open issue card on github or on the cfx post if you have any issues/bugs/improvements.
 * 
 * Issues:
 *   - Snipers force 3rd person view due to (SCRIPTED_GUN_TASK_PLANE_WING).
 *
 * Usage: 
 * - Control.Duck (Ctrl) is used to modify stance.  
 * - Holding Ctrl while in Idle, Stealth, or Crouch will immediately transfer to Prone 
 * - Player will dive if transferring to prone while sprinting
 * - Control.Sprint (Shift) while prone will toggle between on front and on back
 * - Control.Jump (Space) will set the stance state back to Idle
 * - States: Idle -> Stealth -> Crouch -> Prone -> Idle
 *
 *  Commits:
 *   - 30/1/2020 | 1.0.0 | Initial release, credits to TimothyDexter (https://forum.cfx.re/t/release-stance-modifier-crouch-and-prone/172038)
 *   - 1/2/2020 | 1.0.1 | Patch for Dive, now works.
 *   - 2/2/2020 | 1.0.2 | Removed Server.js and the console message
 * 
 */


/*
TIMERS AND DELAYS (DO NOT TOUCH IT, THOSE ARE PRECISE)
*/
const delays = 1000;
const proneToRagdollInvincibleTime = 250;
const transitionDiveToProne = 1050;
const crawlOnFront = 850;
const crawlOnBack = 1200;

// VARIABLES (DO NOT TOUCH IT)
let _lastKeyPress;
let _lastLeftRightPress;
let _lastBodyFlip;
let _debounceTime;

let _diveActive;
let _crawlActive;
let _proneAimActive;
let _holdStateToggleActive;

let _isCrouchBlocked;
let _isProneBlocked;

let _proneState;
let _previousProneState;

let _previousWeapon;

let state; // The Current state [idle, crouch, prone]

/*
CONTROL:
refer to this document if you would like to change any control: https://docs.fivem.net/docs/game-references/controls/
*/
const controls = {
    duck: 36, // Duck (LEFT CTRL)
    proneFrontBackControl: 21, // Sprint (LEFT SHIFT)
    cancelToIdleControl: 22, //Jump (SPACE)
    moveUpOnly: 32, // Move Forward (W)
    moveDownOnly: 33, // Move Backward (S)
    moveLeftOnly: 34, // Move Left (D)
    moveRightOnly: 35, // Move Right (A)
    aim: 25, // Aim (RIGHT MOUSE)
};

const stanceStates = {
    idle: 0,
    stealth: 1,
    crouch: 3,
    prone: 4
};

const movements = {
    forward: 0,
    backward: 1
};

const proneStates = {
    onFront: 0,
    onBack: 1
};


/*
[Summary]
     const functions = Initialize functions
[!Summary]
*/
try {
    RequestAnimDict('move_crawl');
    RequestAnimDict('move_jump');
    RequestAnimSet('move_ped_crouched');
    state = stanceStates.idle;
    setTick(async() => {
        await Wait(1);
        onTick();
    });
    setTick(async() => {
        await Wait(1);
        modifyStance();
    });
} catch (err) {
    handleError(err)
}

/*
<summary>
    Stance OnTick
</summary>;
*/
async function onTick() {

    try {
        const _ped = GetPlayerPed(-1);
        switch (state) {
            case stanceStates.idle:
                {
                    SetPedStealthMovement(_ped, false, "0")
                    resetAnimations();
                }
                break;
            case stanceStates.stealth:
                {
                    SetPedStealthMovement(_ped, true, "0")
                }
                break;
            case stanceStates.crouch:
                {
                    SetPedStealthMovement(_ped, false, "0")

                    if (GetFollowPedCamViewMode() === 4) {
                        SetFollowPedCamViewMode(0);
                    }

                    if (isCrouchStateCancelled() || _isCrouchBlocked) {
                        state = stanceStates.idle;
                        break;
                    }

                    SetPedMovementClipset(_ped, 'move_ped_crouched', 0.55);
                    SetPedStrafeClipset(_ped, 'move_ped_crouched_strafing');
                }
                break;
            case stanceStates.prone:
                {
                    disableStealthControl();
                    SetPedStealthMovement(_ped, false, "0")
                    if (_diveActive) break;

                    if (isProneStateCancelled() || _isProneBlocked) {
                        state = stanceStates.idle;
                        break;
                    }

                    handleProneStateToggle();
                    handleProneAim();
                    await handleProneWeaponChange();

                    if (_proneAimActive) break;

                    await proneMovement();
                }
                break;

            default:
                {
                    await Wait(delays);
                }
        }
    } catch (err) {
        handleError(err);
    }
    await Wait(0);
}

/*
<summary>
    Handle stance changes
</summary>
*/
async function modifyStance() {
    try {
        const _ped = GetPlayerPed(-1);

        if (IsPedCuffed(_ped) || IsPedUsingAnyScenario(_ped) || IsEntityPlayingAnim(_ped, 'mp_arresting', 'idle', 3) ||
            IsEntityPlayingAnim(_ped, 'random@mugging3', 'handsup_standing_base', 3) || IsEntityPlayingAnim(_ped, 'random@arrests@busted', 'idle_a', 3) ||
            IsControlJustPressed(2, controls.cancelToIdleControl) || IsPedInAnyVehicle(_ped, false) || IsEntityInWater(_ped) || IsPedSwimming(_ped) ||
            IsPedSwimmingUnderWater(_ped) || GetVehiclePedIsTryingToEnter(_ped) !== 0) {
            if (state === stanceStates.crouch) {
                cancelCrouch();
                state = stanceStates.idle;
            } else if (state === stanceStates.stealth) {
                state = stanceStates.idle;
            } else if (state === stanceStates.prone) {
                await advanceState();
            }
            return;
        }
        if (IsControlJustPressed(2, controls.duck)) {
            _holdStateToggleActive = false;
            _lastKeyPress = GetGameTimer();
        } else if (IsControlPressed(2, controls.duck)) {
            if (!_isProneBlocked) {
                if (_lastKeyPress < GetGameTimer() - 200) {
                    _holdStateToggleActive = true;
                    if (state === stanceStates.idle || state === stanceStates.stealth || state === stanceStates.crouch) {
                        await transitionToProneState();
                    }
                }
            }
        } else if (IsControlJustReleased(0, controls.duck)) {
            if (_lastKeyPress >= GetGameTimer() - 10) return;
            _lastKeyPress = GetGameTimer();
            if (!_holdStateToggleActive) {
                await advanceState();
            }
        }
    } catch (err) {
        handleError(err);
    }
}

/*
<summary>
    Handle canceling crouch
</summary>
*/
function cancelCrouch() {
    try {
        const _ped = GetPlayerPed(-1);
        ResetPedMovementClipset(_ped, 1);
        ResetPedStrafeClipset(_ped);
    } catch (err) {
        handleError(err);
    }
}

/*
<summary>
    Handle state changes
</summary>
*/
async function advanceState() {
    try {
        const _ped = GetPlayerPed(-1);
        ClearPedTasks(_ped);
        cancelCrouch();
        switch (state) {
            case stanceStates.idle:
                {
                    state = stanceStates.stealth;
                }
                break;
            case stanceStates.stealth:
                {
                    if (_isCrouchBlocked) {
                        state = stanceStates.idle;
                        return;
                    }
                    state = stanceStates.crouch;
                }
                break;
            case stanceStates.crouch:
                {
                    if (_isProneBlocked) {
                        state = stanceStates.idle;
                        return;
                    }
                    await transitionToProneState();
                }
                break;
            case stanceStates.prone:
                {
                    transitionProneToIdle();
                    state = stanceStates.idle;
                }
                break;
            default:
                {
                    console.error('Entered unused default stance state!');
                }
                break;
        }
    } catch (err) {
        handleError(err);
    }
}

/*
<summary>
    Handle player movement inputs in prone state
</summary>
*/
function proneMovement() {
    try {
        if (IsControlJustPressed(2, controls.moveDownOnly) || IsControlJustPressed(2, controls.moveUpOnly)) {
            _debounceTime = 100;
            _lastKeyPress = GetGameTimer();
            if (!_crawlActive) {
                handleCrawlMovement(IsControlJustPressed(2, controls.moveUpOnly) ? movements.forward : movements.backward);
            }
        } else if (IsControlPressed(2, controls.moveDownOnly) || IsControlPressed(2, controls.moveUpOnly)) {
            if (_lastKeyPress >= GetGameTimer() - _debounceTime) return;
            _lastKeyPress = GetGameTimer();
            _debounceTime = 10;

            if (!_crawlActive) {
                handleCrawlMovement(IsControlPressed(2, controls.moveUpOnly) ? movements.forward : movements.backward);
            }
        }
        if (IsControlJustPressed(2, controls.moveLeftOnly) || IsControlJustPressed(2, controls.moveRightOnly)) {
            _debounceTime = 100;
            _lastLeftRightPress = GetGameTimer();

            const entity = GetPlayerPed(-1);
            SetEntityHeading(entity, IsControlJustPressed(2, controls.moveLeftOnly) ? GetEntityHeading(entity) + 2 : GetEntityHeading(entity) - 2);
        } else if (IsControlPressed(2, controls.moveLeftOnly) || IsControlPressed(2, controls.moveRightOnly)) {
            // if (_lastKeyPress >= GetGameTimer() - _debounceTime) return;
            _debounceTime = 10;
            _lastLeftRightPress = GetGameTimer();

            const entity = GetPlayerPed(-1);
            SetEntityHeading(entity, IsControlPressed(2, controls.moveLeftOnly) ? GetEntityHeading(entity) + .75 : GetEntityHeading(entity) - .75);
        }
    } catch (err) {
        handleError(err);
    }
}

/*
<summary>
    Trigger player prone animation
</summary>
<param name="proneState">on front or on back prone state</param>
*/
function goProne(proneState) {
    try {
        const entity = GetPlayerPed(-1);
        if (_proneState !== _previousProneState) {
            SetEntityHeading(entity, GetEntityHeading(entity) + 180);
            _previousProneState = _proneState;
        }

        const animName = proneState === proneStates.onFront ? 'onfront_fwd' : 'onback_fwd';
        const [pX, pY, pZ] = GetEntityCoords(entity);
        const [rX, rY, rZ] = GetEntityRotation(entity, 0);
        const animStartTime = 1000;
        const animFlags = 2; // ANIM_FLAG_STOP_LAST_FRAME
        TaskPlayAnimAdvanced(entity, 'move_crawl', animName, pX, pY, pZ, rX, rY, rZ, 8, -8, -1, animFlags, animStartTime, 2, 0);
    } catch (err) {
        handleError(err);
    }
}

/*
<summary>
    Trigger player prone animation
</summary>
<param name="proneState">on front or on back prone state</param>
*/
async function transitionToProneState() {
    try {
        const _ped = GetPlayerPed(-1);
        state = stanceStates.prone;
        _proneAimActive = false;
        _proneState = proneStates.onFront;
        _previousProneState = proneStates.onFront;
        _previousWeapon = GetHashKey(GetCurrentPedWeapon(_ped, true));
        if (IsPedRunning(_ped) || IsPedSprinting(_ped)) {
            ClearPedTasks(_ped);
            _diveActive = true;
            TaskPlayAnim(_ped, "move_jump", "dive_start_run", 8.0, -8.0, -1, 0, 0.0, 0, 0, 0)
            setTimeout(() => {
                _diveActive = false;
            }, transitionDiveToProne)
        }
        setTimeout(() => {
            if (IsPedRagdoll(_ped)) {
                state = stanceStates.idle;
            } else if (IsPedArmed(_ped, 4)) {
                TaskAimGunScripted(_ped, GetHashKey('SCRIPTED_GUN_TASK_PLANE_WING'), true, true);
            } else {
                TaskPlayAnim(_ped, 'move_crawl', 'onfront_fwd', 8, -8, -1, 2, 0);
            }
        }, _diveActive ? transitionDiveToProne : 0)
    } catch (err) {
        handleError(err);
    }
}

/*
<summary>
    Transition from prone to idle
</summary>
*/
async function transitionProneToIdle() {
    try {
        // Going ragdoll while prone has a small chance of inflicting dmg to ped, this should prevent that
        const entity = GetPlayerPed(-1);
        SetEntityInvincible(entity, true);
        SetPedToRagdoll(entity, 1, 1, 2);
        setTimeout(() => {
            SetEntityInvincible(entity, false);

        }, proneToRagdollInvincibleTime)
    } catch (err) {
        handleError(err);
    }
}

/*
<summary>
    Handle player crawling movement
</summary>
<param name="movementDirection">fwd or bwd movement</param>
*/

async function handleCrawlMovement(movementDirection) {
    try {
        if (_crawlActive) return;
        _crawlActive = true;
        await crawl(movementDirection, _proneState);

        setTimeout(() => {
            _crawlActive = false;
        }, _proneState === proneStates.onFront ? crawlOnFront : crawlOnBack);
    } catch (err) {
        handleError(err);
        _crawlActive = false;
    }
}

/*
<summary>
    Trigger player crawling animation
</summary>
<param name="movementDirection">fwd or bwd movement</param>
<param name="proneState">on front or on back prone state</param>
*/
async function crawl(movementDirection, proneState) {
    try {
        const proneStateStr = proneState === proneStates.onFront ? 'onfront' : 'onback';
        let movementStr;
        if (proneState === proneStates.onFront) {
            movementStr = movementDirection === movements.forward ? 'fwd' : 'bwd';
        } else {
            movementStr = movementDirection === movements.forward ? 'bwd' : 'fwd';
        }
        const entity = GetPlayerPed(-1);
        const animStr = `${proneStateStr}_${movementStr}`;
        StopAnimTask(entity, 'move_crawl', animStr, 0.0);
        await TaskPlayAnim(entity, 'move_crawl', animStr, 8, -8, -1, 2, 0);
    } catch (err) {
        handleError(err);
    }
}

/*
<summary>
    Handle prone front/back toggle
</summary>
*/
function handleProneStateToggle() {
    try {
        if (!IsControlJustPressed(0, controls.proneFrontBackControl)) return;

        if (_lastBodyFlip >= GetGameTimer() - 1000) return;

        _lastBodyFlip = GetGameTimer();

        _proneState = _proneState === proneStates.onFront ? proneStates.onBack : proneStates.onFront;
        goProne(_proneState);
    } catch (err) {
        handleError(err);
    }
}

/*
<summary>
    Handle prone weapon changes
</summary>
*/
async function handleProneWeaponChange() {
    try {
        const _ped = GetPlayerPed(-1);
        const currentWeapon = GetHashKey(GetCurrentPedWeapon(_ped, true));
        if (_previousWeapon !== currentWeapon) {
            _previousWeapon = currentWeapon;
            const proneState = _proneState === proneStates.onBack ? proneStates.onBack : proneStates.onFront;
            goProne(proneState);
            await Wait(1000);
        }
    } catch (err) {
        handleError(err);
    }
}

/*
<summary>
    Handle prone aiming
</summary>
*/
function handleProneAim() {
    try {
        const _ped = GetPlayerPed(-1);
        const playerIsArmed = IsPedArmed(_ped, 4);
        if (playerIsArmed && !_crawlActive && !_proneAimActive && IsControlPressed(2, controls.aim)) {
            TaskAimGunScripted(_ped, GetHashKey('SCRIPTED_GUN_TASK_PLANE_WING'), true, true);

            if (!_proneAimActive && _proneState === proneStates.onBack) {
                const [rX, rY, rZ] = GetEntityRotation(_ped, 5);
                SetEntityRotation(_ped, rX, rY, rZ + 180);
            }
            _proneAimActive = true;

            // TODO: Sniper overlay will not occur w/ "SCRIPTED_GUN_TASK_PLANE_WING" no matter what. #TimothyDexter (https://forum.cfx.re/u/timothy_dexter)
            // if (isUsingWeaponWithScope()) {
            //     console.log('Sniper used!')
            DisplaySniperScopeThisFrame();
            SetPedConfigFlag(_ped, 72, true)
                // }
        } else if (playerIsArmed && IsControlJustReleased(2, controls.aim)) {
            TaskAimGunScripted(_ped, GetHashKey('SCRIPTED_GUN_TASK_PLANE_WING'), false, false);
            _proneAimActive = false
            if (_proneState === proneStates.onBack) {
                const [rX, rY, rZ] = GetEntityRotation(_ped, 5);
                SetEntityRotation(_ped, rX, rY, rZ + 180);
                goProne(proneStates.onBack);
            }
        }
    } catch (err) {
        handleError(err);
    }
}

/*
<summary>
    Returns if a player is currently in the prone position
</summary>
*/
function isPlayerProne() {
    try {
        return state === proneStates.prone;
    } catch (err) {
        handleError(err);
        return false;
    }
}

/*
[Summary]
     Return (and handle) whether or not player has cancelled Crouch state
[!Summary]
*/
function isCrouchStateCancelled() {
    try {
        const _ped = GetPlayerPed(-1);
        if (!IsPedRagdoll(_ped) && !IsPedInMeleeCombat(_ped)) return false;

        ClearPedTasks(_ped);
        ResetPedMovementClipset(_ped, 1);
        ResetPedStrafeClipset(_ped);
        return true;
    } catch (err) {
        handleError(err);
        return false;
    }
}

/*
[Summary]
     Return (and handle) whether or not player has cancelled prone state
[!Summary]
*/
function isProneStateCancelled() {
    try {
        const _ped = GetPlayerPed(-1);
        if (IsPedInMeleeCombat(_ped)) {
            SetPedToRagdoll(_ped, 1, 1, 0);
        }
        if (!IsPedRagdoll(_ped)) return false;

        ClearPedTasks(_ped);
        return true;
    } catch (err) {
        handleError(err);
        return false;
    }
}

/*
[Summary]
     Return whether or not player is using sniper rifle
[!Summary]
*/
function isUsingWeaponWithScope() {
    try {
        console.log('checking Weapon now..')
        const _ped = GetPlayerPed(-1);
        const currentWeapon = GetHashKey(GetCurrentPedWeapon(_ped, true));
        console.log('Weapon checked!')
        const snipers = [
            GetHashKey('weapon_sniperrifle'),
            GetHashKey('weapon_heavysniper'),
            GetHashKey('weapon_heavysniper_mk2'),
            GetHashKey('weapon_marksmanrifle'),
            GetHashKey('weapon_marksmanrifle_mk2'),
            '679988344'
        ]
        console.log('This Is Your Weapon Hash: ' + currentWeapon)
        snipers.forEach(sniper => console.log(sniper))
        let checkSniperResult = false

        for (const sniper in snipers) {
            if (currentWeapon === parseInt(sniper)) return checkSniperResult = true;
        }

        return true;
    } catch (err) {
        handleError(err);
        return false;
    }
}


/*
[Summary]
     Disable stealth control (ctrl key)
[!Summary]
*/
function disableStealthControl() {
    try {
        DisableControlAction(0, controls.duck, true);
    } catch (err) {
        handleError(err);
    }
}


/*
[Summary]
    Reset all stance animations
[!Summary]
*/
function resetAnimations() {
    try {
        const entity = GetPlayerPed(-1);
        if (IsEntityPlayingAnim(entity, 'move_jump', 'dive_start_run', 3)) {
            StopAnimTask(entity, 'move_jump', 'dive_start_run', 0.0);
        }

        const animationList = ['onfront_fwd', 'onfront_bwd', 'onback_fwd', 'onback_bwd'];

        for (const animation in animationList) {
            if (IsEntityPlayingAnim(entity, 'move_crawl', animation, 3)) {
                StopAnimTask(entity, 'move_crawl', animation, 0.0);
            }
        }
    } catch (err) {
        handleError(err);
    }
}

function handleBlockingEventWrapper(blockCrouch, blockProne) {
    try {
        _isCrouchBlocked = blockCrouch;
        _isProneBlocked = blockProne;
    } catch (err) {
        handleError(err);
    }
}

function handleError(err) {
    console.error('=========[ STANCE ERROR ]=========');
    console.error(err.name);
    console.error(err.message);
    console.error(err.stack);
    console.error('=========[ STANCE ERROR ]=========');
}
