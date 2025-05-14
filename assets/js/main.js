// ===== UAV Management =====
const uavState = {
    uavs: [], // { id, element, x, y, speedPxPerMs, angle, alive, patternName, patternState, width, height, typeConfig }
    uavIdCounter: 0,
    respawnQueue: [], // { timeToSpawn: number (timestamp) }
    lastTimestamp: 0,
    config: {
        maxActiveUAVs: 1,
        respawnDelayMs: 5000,
        types: [
            {
                name: "DefaultUAV",
                width: 220,
                height: 45,
                baseSpeedPxPerMs: 0.04, // Adjusted for visibility, e.g., 40px/sec if 1000ms/sec
                cssClass: 'uav',
                clickableChildClass: 'uav-child-button',
                flightPatternName: 'linearAcrossStrict',
            }
        ],
        flightPatterns: {
            linearAcrossStrict: function(uav, deltaTime) {
                const viewportWidth = window.innerWidth;
                const viewportHeight = window.innerHeight;

                if (!uav.patternState || !uav.patternState.initialized) {
                    uav.x = -(uav.width / 2) - 10;
                    uav.y = viewportHeight * (0.15 + Math.random() * 0.15);
                    uav.angle = 0;

                    uav.patternState = {
                        initialized: true,
                    };
                }

                uav.x += uav.speedPxPerMs * deltaTime;

                if (uav.x - uav.width / 2 > viewportWidth + 10) {
                    uav.alive = false;
                }
                if (uav.y < -uav.height * 2 || uav.y > viewportHeight + uav.height * 2) {
                     uav.alive = false;
                }
            },
            linearAcross: function(uav, deltaTime) {
                const viewportWidth = window.innerWidth;
                const viewportHeight = window.innerHeight;

                if (!uav.patternState || !uav.patternState.initialized) {
                    const goingRight = Math.random() < 0.5;
                    uav.x = goingRight ? -uav.width : viewportWidth;
                    uav.y = viewportHeight * (0.1 + Math.random() * 0.3);
                    uav.angle = goingRight ? (Math.random() * 20 - 10) : (180 + Math.random() * 20 - 10);

                    uav.patternState = {
                        targetX: goingRight ? viewportWidth + uav.width * 1.5 : -uav.width * 1.5,
                        targetY: uav.y + (Math.random() * 100 - 50),
                        initialized: true,
                        goingRight: goingRight,
                    };
                    const dxInitial = uav.patternState.targetX - uav.x;
                    const dyInitial = uav.patternState.targetY - uav.y;
                    uav.angle = Math.atan2(dyInitial, dxInitial) * 180 / Math.PI;
                }

                const moveX = Math.cos(uav.angle * Math.PI / 180) * uav.speedPxPerMs * deltaTime;
                const moveY = Math.sin(uav.angle * Math.PI / 180) * uav.speedPxPerMs * deltaTime;

                uav.x += moveX;
                uav.y += moveY;

                if ((uav.patternState.goingRight && uav.x > viewportWidth + uav.width * 2) ||
                    (!uav.patternState.goingRight && uav.x < -uav.width * 2) ||
                    uav.y < -uav.height * 2 || uav.y > viewportHeight + uav.height * 2) {
                    uav.alive = false;
                }
            }
        }
    }
};

function createUAVElement(uavData) {
    const uavElement = document.createElement('div');
    uavElement.id = `uav-${uavData.id}`;
    uavElement.className = uavData.typeConfig.cssClass;
    uavElement.style.width = `${uavData.width}px`;
    uavElement.style.height = `${uavData.height}px`;
    uavElement.style.position = 'absolute'
    uavElement.style.opacity = '1';
    uavElement.style.zIndex = '50';

    const clickableArea = document.createElement('div');
    clickableArea.className = uavData.typeConfig.clickableChildClass;
    uavElement.appendChild(clickableArea);

    clickableArea.addEventListener('click', () => {
        if (uavData.alive && f35State.mode === 'IDLE') {
            window.startF35Intercept(uavElement, null);
        } else if (uavData.alive && f35State.uavElement !== uavElement && window.isIntercepting) {
            showSystemMessage("F35 ALREADY ENGAGED. AWAIT CURRENT TARGET DESTRUCTION.", 2500);
        }
    });

    document.body.appendChild(uavElement);
    return uavElement;
}

function spawnNewUAV(typeIndex = 0) {
    if (uavState.uavs.filter(u => u.alive).length >= uavState.config.maxActiveUAVs) {
        return;
    }

    uavState.uavIdCounter++;
    const typeConfig = uavState.config.types[typeIndex];
    if (!typeConfig) {
        console.error(`Invalid UAV typeIndex: ${typeIndex}`);
        return;
    }
     if (!uavState.config.flightPatterns[typeConfig.flightPatternName]) {
        console.error(`Flight pattern "${typeConfig.flightPatternName}" not found for UAV type "${typeConfig.name}"!`);
        return;
    }

    const uavData = {
        id: uavState.uavIdCounter,
        typeConfig: typeConfig,
        width: typeConfig.width,
        height: typeConfig.height,
        x: 0,
        y: 0,
        angle: 0,
        speedPxPerMs: typeConfig.baseSpeedPxPerMs * (0.9 + Math.random() * 0.2),
        alive: true,
        patternName: typeConfig.flightPatternName,
        patternState: { initialized: false },
    };
    uavData.element = createUAVElement(uavData);

    const patternFn = uavState.config.flightPatterns[uavData.patternName];
    if (patternFn) {
        patternFn(uavData, 0);
    } else {
        console.error(`Pattern function ${uavData.patternName} not found during spawn for UAV ${uavData.id}`);
        if (uavData.element && uavData.element.parentNode) uavData.element.remove();
        return;
    }

    uavData.element.style.left = `${uavData.x - uavData.width / 2}px`;
    uavData.element.style.top = `${uavData.y - uavData.height / 2}px`;
    uavData.element.style.transform = `rotate(${uavData.angle}deg)`;

    uavState.uavs.push(uavData);
}

function updateActiveUAVs(deltaTime) {
    for (let i = uavState.uavs.length - 1; i >= 0; i--) {
        const uav = uavState.uavs[i];
        if (uav.alive) {
            const patternFn = uavState.config.flightPatterns[uav.patternName];
            if (patternFn) {
                patternFn(uav, deltaTime);
            } else {
                console.warn(`No pattern function for ${uav.patternName} on UAV ${uav.id}`);
                uav.alive = false;
            }

            if (uav.element) {
                uav.element.style.left = `${uav.x - uav.width / 2}px`;
                uav.element.style.top = `${uav.y - uav.height / 2}px`;
                uav.element.style.transform = `rotate(${uav.angle}deg)`;
            } else {
                console.warn(`UAV ${uav.id} is alive but has no element.`);
                uav.alive = false;
            }

            if (!uav.alive) {
                handleUAVDestroyedVisuals(uav, false);
            }
        }
    }
}

function processUAVRespawnQueue(currentTime) {
    for (let i = uavState.respawnQueue.length - 1; i >= 0; i--) {
        if (currentTime >= uavState.respawnQueue[i].timeToSpawn) {
            spawnNewUAV();
            uavState.respawnQueue.splice(i, 1);
        }
    }
}

function handleUAVDestroyedVisuals(uav, byMissile = true) {
    if (!uav) {
        console.warn("handleUAVDestroyedVisuals called with null uav");
        return;
    }
    uav.alive = false;

    if (uav.element) {
        uav.element.style.opacity = '0';
        setTimeout(() => {
            if (uav.element && uav.element.parentNode) {
                uav.element.remove();
            }
            uav.element = null;
        }, byMissile ? 200 : 500);
    }

    const liveUAVs = uavState.uavs.filter(u_ => u_.alive && u_.id !== uav.id).length;
    if (liveUAVs < uavState.config.maxActiveUAVs || uavState.config.maxActiveUAVs === 1) {
        const recentQueueThreshold = 1000;
        const isRecentlyQueued = uavState.respawnQueue.some(
            item => (performance.now() - (item.timeToSpawn - uavState.config.respawnDelayMs)) < recentQueueThreshold
        );
        if (!isRecentlyQueued) {
            uavState.respawnQueue.push({ timeToSpawn: performance.now() + uavState.config.respawnDelayMs });
        }
    }

    if (f35State.uavElement === uav.element) {
        f35State.uavElement = null;
    }
}

let uavUpdateLoopId = null;
function runUAVSystem(timestamp) {
    if (!uavState.lastTimestamp) {
        uavState.lastTimestamp = timestamp;
        if (uavState.uavs.filter(u => u.alive).length === 0 && uavState.respawnQueue.length === 0) {
            spawnNewUAV();
        }
    }
    const deltaTime = timestamp - uavState.lastTimestamp;
    uavState.lastTimestamp = timestamp;

    if (deltaTime > 0) {
        updateActiveUAVs(deltaTime);
        processUAVRespawnQueue(timestamp);
    } else if (deltaTime < 0) {
        console.warn("UAV System: Negative deltaTime detected!", deltaTime);
    }

    if (uavState.uavs.filter(u => u.alive).length === 0 && uavState.respawnQueue.length === 0) {
        const canForceSpawn = !uavState.forceSpawnCooldown || timestamp > uavState.forceSpawnCooldown;
        if (canForceSpawn) {
            spawnNewUAV();
            uavState.forceSpawnCooldown = timestamp + 2000;
        }
    }
    uavUpdateLoopId = requestAnimationFrame(runUAVSystem);
}

// ===== F35 INTERCEPTION LOGIC (CALLED FROM REACT) =====

let f35FlightAnimFrameId = null;
let missileAnimFrameId = null;
let targetBracketsAnimFrameId = null;
let smokeIntervalId = null;
let explosionTimeoutId = null;

const f35State = {
    element: null,
    x: 0, y: 0,
    angle: 0,
    speed: 0,
    targetSpeed: 0.5,
    acceleration: 0.003,
    deceleration: 0.005,
    turnRate: 0.5,
    mode: 'IDLE',
    waypoint: { x: 0, y: 0 },
    timeInMode: 0,
    hasFired: false,
    uavElement: null,
    missileElement: null,
    explosionElement: null,
    clickedButtonElement: null,
    targetBracketsElement: null,
    initialUAVAimPos: {x:0, y:0},
    MIN_FIRING_DISTANCE: 300,
    MANEUVER_ANGLE_THRESHOLD: 20,
    MANEUVER_SLOWDOWN_FACTOR: 0.6,
    MIN_EFFECTIVE_SPEED: 1.0,
    spriteMirrorX: false,
    missileFlightState: {
        speed: 0,
        targetSpeed: 0.06,
        acceleration: 0.02,
        spriteMirrorX: false,
        currentAngleDeg: 0
    }
};

function resetGlobalAnimationState() {
    if (f35FlightAnimFrameId) cancelAnimationFrame(f35FlightAnimFrameId);
    if (missileAnimFrameId) cancelAnimationFrame(missileAnimFrameId);
    if (targetBracketsAnimFrameId) cancelAnimationFrame(targetBracketsAnimFrameId);
    if (smokeIntervalId) clearInterval(smokeIntervalId);
    if (explosionTimeoutId) clearTimeout(explosionTimeoutId);

    f35FlightAnimFrameId = null;
    missileAnimFrameId = null;
    targetBracketsAnimFrameId = null;
    smokeIntervalId = null;
    explosionTimeoutId = null;

    f35State.hasFired = false;
    f35State.timeInMode = 0;
    f35State.spriteMirrorX = false;
    if (f35State.missileFlightState) {
        f35State.missileFlightState.spriteMirrorX = false;
    }

    const f35 = document.querySelector('.f35');
    if (f35 && f35State.mode === 'IDLE') {
      f35.style.opacity = '0';
      f35.classList.remove('animating');
    }
    const missile = document.querySelector('.missile');
    if(missile) missile.style.opacity = '0';
    const explosion = document.querySelector('.explosion');
    if(explosion) {
        explosion.style.opacity = '0';
        explosion.style.animation = 'none';
        explosion.style.backgroundPositionX = '0px';
        explosion.style.backgroundPositionY = '0px';
    }
    let tb = document.querySelector('.target-brackets');
    if (tb && tb.parentNode) {
        tb.remove();
    }
    f35State.targetBracketsElement = null;
}

function showSystemMessage(message, duration = 2000) {
    let systemMessagesContainer = document.querySelector('.system-messages');
    if (!systemMessagesContainer) {
        systemMessagesContainer = document.createElement('div');
        systemMessagesContainer.className = 'system-messages';
        document.body.appendChild(systemMessagesContainer);
    }
    const messageElement = document.createElement('div');
    messageElement.className = 'system-message';
    messageElement.textContent = message;
    systemMessagesContainer.appendChild(messageElement);
    setTimeout(() => {
        messageElement.style.opacity = '1';
        messageElement.style.transform = 'translateX(0)';
    }, 10);
    setTimeout(() => {
        messageElement.style.opacity = '0';
        messageElement.style.transform = 'translateX(20px)';
        setTimeout(() => { if (messageElement.parentNode) messageElement.remove(); }, 500);
    }, duration);
}

function updateF35Flight() {
    if (!f35State.element || f35State.mode === 'IDLE') {
        if (f35FlightAnimFrameId) cancelAnimationFrame(f35FlightAnimFrameId);
        f35FlightAnimFrameId = null;
        if (f35State.element && f35State.mode === 'IDLE') f35State.element.style.opacity = '0';
        return;
    }

    f35State.timeInMode++;

    let uavCenterX = f35State.waypoint.x;
    let uavCenterY = f35State.waypoint.y;
    let uavIsValid = false;

    if (f35State.uavElement && f35State.uavElement.parentNode && f35State.uavElement.style.opacity !== '0') {
        const uavRect = f35State.uavElement.getBoundingClientRect();
        const uavObj = uavState.uavs.find(u => u.element === f35State.uavElement);
        if (uavRect.width > 0 && uavObj && uavObj.alive) {
            uavIsValid = true;
            uavCenterX = uavRect.left + uavRect.width / 2;
            uavCenterY = uavRect.top + uavRect.height / 2;
            if (f35State.mode === 'ALIGNING_TO_UAV' || f35State.mode === 'FIRING_WINDOW') {
                f35State.waypoint.x = uavCenterX;
                f35State.waypoint.y = uavCenterY;
            }
        }
    }

    if (!uavIsValid && f35State.mode !== 'ENTERING' && f35State.mode !== 'IDLE' && f35State.mode !== 'DISENGAGING') {
        let newTargetUAVObject = uavState.uavs.find(u => u.alive && u.element && u.element.style.opacity !== '0');
        if (newTargetUAVObject && window.isIntercepting) {
            f35State.uavElement = newTargetUAVObject.element;
            const newUavRect = f35State.uavElement.getBoundingClientRect();
            f35State.initialUAVAimPos.x = newUavRect.left + newUavRect.width / 2;
            f35State.initialUAVAimPos.y = newUavRect.top + newUavRect.height / 2;
            uavCenterX = f35State.initialUAVAimPos.x;
            uavCenterY = f35State.initialUAVAimPos.y;
            uavIsValid = true;
            showSystemMessage("TARGET NEUTRALIZED. ACQUIRING NEW HOSTILE SIGNATURE.", 2000);
            f35State.mode = 'APPROACH_WAYPOINT_1';
            f35State.timeInMode = 0;
            f35State.hasFired = false;
            const offScreenSide = f35State.initialUAVAimPos.x < window.innerWidth / 2 ? 1 : -1;
            f35State.waypoint.x = f35State.initialUAVAimPos.x + offScreenSide * (300 + Math.random() * 200);
            f35State.waypoint.y = f35State.initialUAVAimPos.y + (Math.random() * 300 - 150);
            f35State.targetSpeed = 5 + Math.random();
        } else if (window.isIntercepting) {
            showSystemMessage("ALL HOSTILES NEUTRALIZED. F35 DISENGAGING.", 3000);
            f35State.mode = 'DISENGAGING';
            f35State.timeInMode = 0;
            const f35ElemWidth = f35State.element ? f35State.element.offsetWidth : 100;
            f35State.waypoint.x = f35State.x < window.innerWidth / 2 ? -(f35ElemWidth + 100) : window.innerWidth + f35ElemWidth + 100;
            f35State.waypoint.y = f35State.y + (Math.random() * 100 - 50);
            f35State.targetSpeed = 4;
            if (f35State.targetBracketsElement) f35State.targetBracketsElement.style.opacity = '0';
        }
    }

    const dx = f35State.waypoint.x - f35State.x;
    const dy = f35State.waypoint.y - f35State.y;
    let targetAngleDeg = Math.atan2(dy, dx) * 180 / Math.PI;

    let angleDiff = targetAngleDeg - f35State.angle;
    while (angleDiff > 180) angleDiff -= 360;
    while (angleDiff < -180) angleDiff += 360;

    let baseTargetSpeedForMode = f35State.targetSpeed;
    let effectiveTargetSpeed = baseTargetSpeedForMode;

    if (Math.abs(angleDiff) > f35State.MANEUVER_ANGLE_THRESHOLD &&
        (f35State.mode === 'ALIGNING_TO_UAV' || f35State.mode === 'APPROACH_WAYPOINT_1' ||
         f35State.mode === 'APPROACH_WAYPOINT_2' || f35State.mode === 'REPOSITIONING')) {
        effectiveTargetSpeed = Math.max(f35State.MIN_EFFECTIVE_SPEED, baseTargetSpeedForMode * f35State.MANEUVER_SLOWDOWN_FACTOR);
    }

    if (f35State.speed < effectiveTargetSpeed) {
        f35State.speed = Math.min(effectiveTargetSpeed, f35State.speed + f35State.acceleration);
    } else if (f35State.speed > effectiveTargetSpeed) {
        f35State.speed = Math.max(effectiveTargetSpeed, f35State.speed - f35State.deceleration);
    }

    const turnThisFrame = Math.max(-f35State.turnRate, Math.min(f35State.turnRate, angleDiff));
    f35State.angle = (f35State.angle + turnThisFrame + 360) % 360;

    const angleRad = f35State.angle * Math.PI / 180;
    f35State.x += Math.cos(angleRad) * f35State.speed;
    f35State.y += Math.sin(angleRad) * f35State.speed;

    f35State.element.style.left = `${f35State.x - f35State.element.offsetWidth / 2}px`;
    f35State.element.style.top = `${f35State.y - f35State.element.offsetHeight / 2}px`;
    f35State.element.style.transform = `rotate(${f35State.angle}deg) ${f35State.spriteMirrorX ? 'scaleX(-1)' : 'scaleX(1)'}`;

    const distanceToWaypoint = Math.sqrt(dx*dx + dy*dy);
    let distanceToUAV = Infinity;
    if (uavIsValid) {
         distanceToUAV = Math.sqrt(Math.pow(uavCenterX - f35State.x, 2) + Math.pow(uavCenterY - f35State.y, 2));
    }

    switch (f35State.mode) {
        case 'ENTERING':
            if (distanceToWaypoint < 50 || f35State.timeInMode > 400) {
                f35State.mode = 'APPROACH_WAYPOINT_1';
                f35State.timeInMode = 0;
                const offScreenSide = f35State.initialUAVAimPos.x < window.innerWidth / 2 ? 1 : -1;
                f35State.waypoint.x = f35State.initialUAVAimPos.x + offScreenSide * (300 + Math.random() * 200);
                f35State.waypoint.y = f35State.initialUAVAimPos.y + (Math.random() * 300 - 150);
                f35State.targetSpeed = 5 + Math.random();
                showSystemMessage("MANEUVERING: INGRESS", 2000);
            }
            break;
        case 'APPROACH_WAYPOINT_1':
            if (!uavIsValid && f35State.timeInMode > 50) { break; }
            if (distanceToWaypoint < 100 || f35State.timeInMode > 300) {
                f35State.mode = 'APPROACH_WAYPOINT_2';
                f35State.timeInMode = 0;
                if (uavIsValid) {
                    f35State.waypoint.x = uavCenterX + (Math.random() < 0.5 ? -1 : 1) * (200 + Math.random()*100);
                    f35State.waypoint.y = uavCenterY + (Math.random() * 150 - 75);
                } else {
                    f35State.waypoint.x = window.innerWidth / 2;
                    f35State.waypoint.y = window.innerHeight / 2;
                }
                f35State.targetSpeed = 5.5 + Math.random()*0.5;
            }
            break;
        case 'APPROACH_WAYPOINT_2':
            if (!uavIsValid && f35State.timeInMode > 50) { break; }
            if (distanceToWaypoint < 150 || f35State.timeInMode > 250) {
                f35State.mode = 'ALIGNING_TO_UAV';
                f35State.timeInMode = 0;
                f35State.hasFired = false;
                f35State.targetSpeed = 4.5 + Math.random()*0.5;
                if (uavIsValid) showSystemMessage("TARGET IDENTIFIED", 2000);
                setTimeout(() => { if (uavIsValid) showSystemMessage("MISSILE ARMED", 2000);}, 800);
            }
            break;
        case 'ALIGNING_TO_UAV':
            if (!uavIsValid) { break; }
            const angleToUAVLive = Math.atan2(uavCenterY - f35State.y, uavCenterX - f35State.x) * 180 / Math.PI;
            let liveAngleDiff = Math.abs(angleToUAVLive - f35State.angle);
            if (liveAngleDiff > 180) liveAngleDiff = 360 - liveAngleDiff;

            if (distanceToUAV <= f35State.MIN_FIRING_DISTANCE && !f35State.hasFired) {
                showSystemMessage("MINIMUM RANGE - REPOSITIONING", 2000);
                f35State.mode = 'REPOSITIONING';
                f35State.timeInMode = 0;
            } else if (f35State.timeInMode > 80 && !f35State.hasFired && liveAngleDiff < 15 && distanceToUAV < 600 && distanceToUAV > f35State.MIN_FIRING_DISTANCE) { // MODIFIED: Firing arc from 8 to 15 degrees
                f35State.mode = 'FIRING_WINDOW';
                f35State.timeInMode = 0;
            } else if (f35State.timeInMode > 400 && !f35State.hasFired) {
                showSystemMessage("CANNOT ACHIEVE LOCK - REPOSITIONING", 2000);
                f35State.mode = 'REPOSITIONING';
                f35State.timeInMode = 0;
            }
            break;
        case 'FIRING_WINDOW':
            if (!uavIsValid) { break; }
            if (!f35State.hasFired) {
                showSystemMessage("FIRING SOLUTION...", 1000);
                setTimeout(() => {
                    if (f35State.mode !== 'FIRING_WINDOW' || f35State.hasFired || !uavIsValid) return;
                    launchMissileFromF35();
                    f35State.hasFired = true;
                    setTimeout(() => {
                        f35State.mode = 'REPOSITIONING';
                        f35State.timeInMode = 0;
                    }, 250);
                }, 800);
            }
            if (f35State.timeInMode > 20 && f35State.hasFired) {
                 f35State.mode = 'REPOSITIONING';
                 f35State.timeInMode = 0;
            }
            break;
        case 'REPOSITIONING':
            f35State.hasFired = false;
            if (f35State.timeInMode === 1) {
                showSystemMessage("REPOSITIONING", 1500);
                f35State.targetSpeed = 5 + Math.random();
                let repositionX, repositionY;
                if (uavIsValid) {
                    repositionX = uavCenterX + (Math.random() < 0.5 ? -1 : 1) * (400 + Math.random() * 200);
                    repositionY = uavCenterY + (Math.random() * 400 - 200);
                } else {
                    repositionX = window.innerWidth * (0.3 + Math.random() * 0.4);
                    repositionY = window.innerHeight * (0.3 + Math.random() * 0.4);
                }
                f35State.waypoint.x = Math.max(50, Math.min(window.innerWidth - 50, repositionX));
                f35State.waypoint.y = Math.max(50, Math.min(window.innerHeight - 50, repositionY));
            }
            if ((uavIsValid && distanceToWaypoint < 150) || f35State.timeInMode > 250) {
                if (uavIsValid) {
                    f35State.mode = 'APPROACH_WAYPOINT_1';
                    const offScreenSide = f35State.initialUAVAimPos.x < window.innerWidth / 2 ? 1 : -1;
                    f35State.waypoint.x = f35State.initialUAVAimPos.x + offScreenSide * (300 + Math.random() * 200);
                    f35State.waypoint.y = f35State.initialUAVAimPos.y + (Math.random() * 300 - 150);
                    f35State.targetSpeed = 5 + Math.random();
                } else {
                    f35State.timeInMode = 0;
                }
            }
            if (f35State.x < -f35State.element.offsetWidth * 2 || f35State.x > window.innerWidth + f35State.element.offsetWidth * 2 ||
                f35State.y < -f35State.element.offsetHeight * 2 || f35State.y > window.innerHeight + f35State.element.offsetHeight * 2) {
                showSystemMessage("F35 OFF-SCREEN, RE-ENTERING PATROL", 1000);
                f35State.x = Math.random() < 0.5 ? -50 : window.innerWidth + 50;
                f35State.y = window.innerHeight * Math.random();
                f35State.angle = Math.atan2(window.innerHeight/2 - f35State.y, window.innerWidth/2 - f35State.x) * 180 / Math.PI;
                f35State.mode = 'REPOSITIONING';
                f35State.timeInMode = 0;
            }
            break;
        case 'DISENGAGING':
            if (distanceToWaypoint < 100 ||
                f35State.x < -f35State.element.offsetWidth * 1.5 ||
                f35State.x > window.innerWidth + f35State.element.offsetWidth * 1.5 ||
                f35State.timeInMode > 500) {
                f35State.mode = 'IDLE';
                if (f35State.element) f35State.element.style.opacity = '0';
                resetGlobalAnimationState();
            }
            break;
    }

    if (f35State.mode !== 'IDLE') {
      f35FlightAnimFrameId = requestAnimationFrame(updateF35Flight);
    } else {
      if(f35FlightAnimFrameId) cancelAnimationFrame(f35FlightAnimFrameId);
      f35FlightAnimFrameId = null;
      if (f35State.element) f35State.element.style.opacity = '0';
    }
}

function launchMissileFromF35() {
    const missile = f35State.missileElement;
    if (!missile) { console.error("Missile element not found!"); return; }

    const missileWidth = missile.offsetWidth || 50;
    const missileHeight = missile.offsetHeight || 10;
    const f35AngleRad = f35State.angle * Math.PI / 180;
    const f35CurrentWidth = f35State.element.offsetWidth;
    const noseOffsetFactor = f35CurrentWidth * 0.3;
    const missileStartX = f35State.x + (noseOffsetFactor * Math.cos(f35AngleRad)) - missileWidth / 2;
    const missileStartY = f35State.y + (noseOffsetFactor * Math.sin(f35AngleRad)) - missileHeight / 2;

    missile.style.left = `${missileStartX}px`;
    missile.style.top = `${missileStartY}px`;
    f35State.missileFlightState.currentAngleDeg = f35State.angle;
    f35State.missileFlightState.speed = 0;
    missile.style.transform = `rotate(${f35State.missileFlightState.currentAngleDeg}deg) ${f35State.missileFlightState.spriteMirrorX ? 'scaleX(-1)' : 'scaleX(1)'}`;
    missile.style.opacity = '1';
    missile.style.backgroundImage = 'url("../../public/assets/images/Missile_ON.png")';
    setTimeout(() => {
        if (missile.style.opacity !== '0') {
            missile.style.backgroundImage = 'url("../../public/assets/images/Missile_OFF.png")';
        }
    }, 500);

    if (smokeIntervalId) clearInterval(smokeIntervalId);
    smokeIntervalId = setInterval(() => {
        const currentMissileRect = missile.getBoundingClientRect();
        if (missile.style.opacity === '0' || !window.isIntercepting) {
            clearInterval(smokeIntervalId); smokeIntervalId = null; return;
        }
        const smokeTrail = document.createElement('div');
        smokeTrail.className = 'smoke-trail';
        const trailAngleRad = (f35State.missileFlightState.currentAngleDeg || 0) * Math.PI / 180;
        smokeTrail.style.left = `${currentMissileRect.left + currentMissileRect.width / 2 - 5 - Math.cos(trailAngleRad) * (currentMissileRect.width * 0.55)}px`;
        smokeTrail.style.top = `${currentMissileRect.top + currentMissileRect.height / 2 - 5 - Math.sin(trailAngleRad) * (currentMissileRect.width * 0.55)}px`;
        document.body.appendChild(smokeTrail);
        smokeTrail.addEventListener('animationend', () => { if (smokeTrail.parentNode) smokeTrail.remove(); });
    }, 50);

    let missileFrameCount = 0;
    const MAX_MISSILE_FLIGHT_FRAMES = 800;
    let hitOccurred = false;
    const missileTurnRate = 2.2; // degrees per frame

    // Developer Note regarding missile speed:
    // The missile's targetSpeed (f35State.missileFlightState.targetSpeed) is currently ${f35State.missileFlightState.targetSpeed} px/frame.
    // This is extremely slow compared to the UAV's potential speed (e.g., ~0.64 px/frame if UAV moves at 0.04 px/ms and game is at 60fps).
    // Effective homing and interception will be very challenging with this speed disparity.
    // If missile performance is unsatisfactory, consider increasing this targetSpeed significantly (e.g., to 5-10 px/frame).
    // The current homing logic will perform much better with a faster missile.
    // console.warn(`Missile Speed Warning: Target speed is ${f35State.missileFlightState.targetSpeed}px/frame. This is very slow for effective interception.`);

    function animateMissileFlight() {
        if (hitOccurred || !window.isIntercepting) {
            if (missileAnimFrameId) cancelAnimationFrame(missileAnimFrameId); missileAnimFrameId = null;
            if (!hitOccurred && missile) missile.style.opacity = '0';
            if (smokeIntervalId) { clearInterval(smokeIntervalId); smokeIntervalId = null; }
            return;
        }
        missileFrameCount++;

        const targetUAVObject = f35State.uavElement ? uavState.uavs.find(u => u.element === f35State.uavElement) : null;
        if (!targetUAVObject || !targetUAVObject.alive || !targetUAVObject.element || targetUAVObject.element.style.opacity === '0' || !targetUAVObject.element.parentNode) {
            if (hitOccurred) return;
            hitOccurred = true;
            if (missileAnimFrameId) cancelAnimationFrame(missileAnimFrameId); missileAnimFrameId = null;
            if (missile) missile.style.opacity = '0';
            if (smokeIntervalId) { clearInterval(smokeIntervalId); smokeIntervalId = null; }
            showSystemMessage("UAV LOST MID-FLIGHT (MISSILE)", 2000);
            return;
        }

        const uavCurrentRect = targetUAVObject.element.getBoundingClientRect();
        const missileCurrentRect = missile.getBoundingClientRect();

        if (f35State.missileFlightState.speed < f35State.missileFlightState.targetSpeed) {
            f35State.missileFlightState.speed = Math.min(
                f35State.missileFlightState.targetSpeed,
                f35State.missileFlightState.speed + f35State.missileFlightState.acceleration
            );
        }

        const targetMissileX = uavCurrentRect.left + uavCurrentRect.width / 2;
        const targetMissileY = uavCurrentRect.top + uavCurrentRect.height / 2;
        const currentMissileCenterX = missileCurrentRect.left + missileCurrentRect.width / 2;
        const currentMissileCenterY = missileCurrentRect.top + missileCurrentRect.height / 2;

        const dxM = targetMissileX - currentMissileCenterX;
        const dyM = targetMissileY - currentMissileCenterY;
        const angleToTargetRad = Math.atan2(dyM, dxM);
        let angleToTargetDeg = angleToTargetRad * 180 / Math.PI;

        let angleDiffM = angleToTargetDeg - f35State.missileFlightState.currentAngleDeg;
        while (angleDiffM > 180) angleDiffM -= 360;
        while (angleDiffM < -180) angleDiffM += 360;

        const turnThisFrameM = Math.max(-missileTurnRate, Math.min(missileTurnRate, angleDiffM));
        f35State.missileFlightState.currentAngleDeg = (f35State.missileFlightState.currentAngleDeg + turnThisFrameM + 360) % 360;

        // --- MODIFIED MISSILE "POP" / INITIAL PITCH-UP LOGIC ---
        let effectiveThrustAngleDeg = f35State.missileFlightState.currentAngleDeg;
        const initialPitchUpDurationFrames = 25; // How long the pitch-up influence lasts (frames)
        const maxPitchUpAngle = 3.0; // Max degrees to pitch up by (relative to missile's forward direction)

        if (missileFrameCount < initialPitchUpDurationFrames) {
            // Apply a slight upward pitch relative to the missile's current guided orientation.
            // This effect diminishes over `initialPitchUpDurationFrames`.
            // Subtracting from the angle makes it more "upward" (e.g., 0 deg right -> -3 deg up-right).
            const pitchAdjustment = maxPitchUpAngle * (1 - (missileFrameCount / initialPitchUpDurationFrames));
            // Apply adjustment and ensure angle stays within a typical range (e.g. 0-360 or -180 to 180)
            // The current f35State.missileFlightState.currentAngleDeg is already normalized to [0, 360)
            effectiveThrustAngleDeg = f35State.missileFlightState.currentAngleDeg - pitchAdjustment;
        }
        // Convert effective thrust angle to radians for movement calculation
        const thrustAngleRad = effectiveThrustAngleDeg * Math.PI / 180;
        let moveX = Math.cos(thrustAngleRad) * f35State.missileFlightState.speed;
        let moveY = Math.sin(thrustAngleRad) * f35State.missileFlightState.speed;
        // --- END OF MODIFIED "POP" LOGIC ---

        missile.style.left = `${missileCurrentRect.left + moveX}px`;
        missile.style.top = `${missileCurrentRect.top + moveY}px`;
        // Visual rotation uses the primary guided angle, not the temporarily adjusted thrust angle.
        missile.style.transform = `rotate(${f35State.missileFlightState.currentAngleDeg}deg) ${f35State.missileFlightState.spriteMirrorX ? 'scaleX(-1)' : 'scaleX(1)'}`;

        if (missile.style.opacity !== '0' &&
            missileCurrentRect.right > uavCurrentRect.left &&
            missileCurrentRect.left < uavCurrentRect.right &&
            missileCurrentRect.bottom > uavCurrentRect.top &&
            missileCurrentRect.top < uavCurrentRect.bottom) {

            if (hitOccurred) return;
            hitOccurred = true;
            if (missileAnimFrameId) cancelAnimationFrame(missileAnimFrameId); missileAnimFrameId = null;
            if (smokeIntervalId) { clearInterval(smokeIntervalId); smokeIntervalId = null; }

            missile.style.opacity = '0';
            handleUAVDestroyedVisuals(targetUAVObject, true);

            if (targetBracketsAnimFrameId) cancelAnimationFrame(targetBracketsAnimFrameId);
            targetBracketsAnimFrameId = null;
            if (f35State.targetBracketsElement && f35State.targetBracketsElement.parentNode) {
                f35State.targetBracketsElement.remove();
                f35State.targetBracketsElement = null;
            }

            const explosion = f35State.explosionElement;
            explosion.style.left = `${targetMissileX - explosion.offsetWidth / 2}px`;
            explosion.style.top = `${targetMissileY - explosion.offsetHeight / 2}px`;
            explosion.style.opacity = '1';
            explosion.style.animation = 'none';

            const explosionFramesPerRow = 8; const explosionTotalFrames = 48;
            const explosionFrameDuration = 800 / explosionTotalFrames;
            let currentExplosionFrame = 0;
            function animateExplosionStep() {
                if (currentExplosionFrame >= explosionTotalFrames) {
                    if (explosion.parentNode) explosion.style.opacity = '0';
                    return;
                }
                const row = Math.floor(currentExplosionFrame / explosionFramesPerRow);
                const col = currentExplosionFrame % explosionFramesPerRow;
                explosion.style.backgroundPositionX = `-${col * 240}px`;
                explosion.style.backgroundPositionY = `-${row * 240}px`;
                currentExplosionFrame++;
                explosionTimeoutId = setTimeout(animateExplosionStep, explosionFrameDuration);
            }
            animateExplosionStep();
            showSystemMessage("IMPACT CONFIRMED!", 2000);
            return;
        }

        if (missileFrameCount > MAX_MISSILE_FLIGHT_FRAMES && !hitOccurred) {
            if (hitOccurred) return;
            hitOccurred = true;
            if (missileAnimFrameId) cancelAnimationFrame(missileAnimFrameId); missileAnimFrameId = null;
            if (smokeIntervalId) { clearInterval(smokeIntervalId); smokeIntervalId = null; }
            if (missile.style.opacity !== '0') missile.style.opacity = '0';
            showSystemMessage("TARGET MISSED, RE-ENGAGING", 2000);
            return;
        }

        if (!hitOccurred) {
            missileAnimFrameId = requestAnimationFrame(animateMissileFlight);
        }
    }
    missileAnimFrameId = requestAnimationFrame(animateMissileFlight);
}

function actualF35InterceptLogic(visualUavElement, _clickedButtonElement) {
    if (f35State.mode !== 'IDLE') {
        showSystemMessage("F35 ALREADY OPERATIONAL", 1500);
        return;
    }
    resetGlobalAnimationState();

    f35State.element = document.querySelector('.f35');
    f35State.missileElement = document.querySelector('.missile');
    f35State.explosionElement = document.querySelector('.explosion');

    f35State.uavElement = visualUavElement;
    if (!f35State.uavElement || !f35State.uavElement.parentNode) {
        showSystemMessage("INITIAL TARGET INVALID. F35 STANDING BY.", 2000);
        f35State.mode = 'IDLE';
        return;
    }
    const uavRectInitial = visualUavElement.getBoundingClientRect();
    f35State.initialUAVAimPos.x = uavRectInitial.left + uavRectInitial.width / 2;
    f35State.initialUAVAimPos.y = uavRectInitial.top + uavRectInitial.height / 2;

    if (!f35State.element || !f35State.missileElement || !f35State.explosionElement) {
        console.error("F35 Intercept: Missing critical F35/weapon DOM elements.");
        window.isIntercepting = false;
        f35State.mode = 'IDLE';
        return;
    }

    window.isIntercepting = true;
    f35State.element.classList.add('animating');
    f35State.element.style.opacity = '1';
    f35State.element.style.transition = 'none';

    const f35InitialWidth = f35State.element.offsetWidth || 100;
    const targetIsLeftHalf = f35State.initialUAVAimPos.x < window.innerWidth / 2;
    f35State.x = targetIsLeftHalf ? window.innerWidth + f35InitialWidth : -f35InitialWidth;
    f35State.y = (window.innerHeight * (0.15 + Math.random() * 0.25));
    f35State.angle = targetIsLeftHalf ? (180 + (Math.random() * 20 - 10)) : (Math.random() * 20 - 10);

    f35State.speed = 0;
    f35State.targetSpeed = 4 + Math.random();
    f35State.mode = 'ENTERING';
    f35State.timeInMode = 0;
    f35State.hasFired = false;
    f35State.spriteMirrorX = false;
    if (f35State.missileFlightState) f35State.missileFlightState.spriteMirrorX = false;

    f35State.waypoint.x = f35State.initialUAVAimPos.x + (targetIsLeftHalf ? -1 : 1) * (window.innerWidth * 0.2);
    f35State.waypoint.y = f35State.initialUAVAimPos.y + (Math.random() * 100 - 50);

    showSystemMessage("F35 ENGAGING. SCANNING AIRSPACE...", 2000);

    if (!f35State.targetBracketsElement || !f35State.targetBracketsElement.parentNode) {
        let tb = document.querySelector('.target-brackets');
        if (!tb) {
          tb = document.createElement('div');
          tb.className = 'target-brackets';
          document.body.appendChild(tb);
        }
        f35State.targetBracketsElement = tb;
    }

    if (f35State.targetBracketsElement) {
        f35State.targetBracketsElement.style.opacity = '0'; // Briefly hide to ensure animation restarts
        f35State.targetBracketsElement.style.animation = 'none';
        void f35State.targetBracketsElement.offsetWidth; // Force reflow
        f35State.targetBracketsElement.style.animation = 'targetLock 0.75s ease-out forwards';
        // Opacity will be handled by updateTargetBracketsPosition, but set to 1 initially if it was hidden
        f35State.targetBracketsElement.style.opacity = '1';
    }

    if (!targetBracketsAnimFrameId) {
        targetBracketsAnimFrameId = requestAnimationFrame(updateTargetBracketsPosition);
    }
    if (!f35FlightAnimFrameId) {
        f35FlightAnimFrameId = requestAnimationFrame(updateF35Flight);
    }
}
window.startF35Intercept = actualF35InterceptLogic;

function updateTargetBracketsPosition() {
  if (!window.isIntercepting || !f35State.uavElement || !f35State.uavElement.parentNode || f35State.uavElement.style.opacity === '0') {
    if (f35State.targetBracketsElement) {
        f35State.targetBracketsElement.style.opacity = '0';
    }
    if (!window.isIntercepting && targetBracketsAnimFrameId) {
        cancelAnimationFrame(targetBracketsAnimFrameId);
        targetBracketsAnimFrameId = null;
        if (f35State.targetBracketsElement && f35State.targetBracketsElement.parentNode) {
            f35State.targetBracketsElement.remove(); // Clean up brackets if no longer intercepting
            f35State.targetBracketsElement = null;
        }
        // return; // Keep requesting frame if intercepting but UAV is temporarily invalid
    }
    // Continue requesting animation frame even if UAV is temporarily invalid,
    // so it can reappear or track a new UAV if logic allows.
    // Only stop if !window.isIntercepting.
    if (window.isIntercepting) {
        targetBracketsAnimFrameId = requestAnimationFrame(updateTargetBracketsPosition);
    }
    return;
  }

  if (!f35State.targetBracketsElement || !f35State.targetBracketsElement.parentNode) {
      let tb = document.querySelector('.target-brackets');
      if (!tb) {
        tb = document.createElement('div');
        tb.className = 'target-brackets';
        // Ensure the target-brackets element has absolute positioning.
        // This is crucial. It might be better to set this in CSS for .target-brackets.
        // If not set in CSS, uncomment the line below or add to CSS:
        // tb.style.position = 'absolute';
        document.body.appendChild(tb);
      }
      f35State.targetBracketsElement = tb;
      f35State.targetBracketsElement.style.animation = 'targetLock 0.75s ease-out forwards';
  }

  f35State.targetBracketsElement.style.opacity = '1';
  const uavLiveRect = f35State.uavElement.getBoundingClientRect();
  if (uavLiveRect.width === 0 && uavLiveRect.height === 0) { // UAV valid but not rendered fully (e.g., display:none briefly or 0 size)
      f35State.targetBracketsElement.style.opacity = '0';
      targetBracketsAnimFrameId = requestAnimationFrame(updateTargetBracketsPosition);
      return;
  }

  const bracketSizeFactor = 1;
  const bracketWidth = uavLiveRect.width * 0.4;
  const bracketHeight = uavLiveRect.height * 0.9;

  // Get current scroll offsets
  const scrollX = window.scrollX || window.pageXOffset; // pageXOffset for older browsers
  const scrollY = window.scrollY || window.pageYOffset; // pageYOffset for older browsers

  // Calculate the target position for the brackets, including scroll offsets
  const bracketTargetLeft = uavLiveRect.left + scrollX + (uavLiveRect.width / 2) - (bracketWidth / 2) - 55;
  const bracketTargetTop = uavLiveRect.top + scrollY + (uavLiveRect.height / 2) - (bracketHeight / 2);

  f35State.targetBracketsElement.style.left = `${bracketTargetLeft}px`;
  f35State.targetBracketsElement.style.top = `${bracketTargetTop}px`;
  f35State.targetBracketsElement.style.width = `${bracketWidth}px`;
  f35State.targetBracketsElement.style.height = `${bracketHeight}px`;

  targetBracketsAnimFrameId = requestAnimationFrame(updateTargetBracketsPosition);
}

// ===== DUMMY FUNCTIONS (FROM ORIGINAL CONTEXT FOR COMPLETENESS) =====
function initCustomCursor() { /* Placeholder */ }
function initScrollAnimations() { /* Placeholder */ }
function initThemeToggle() { /* Placeholder */ }
function initMobileMenu() { /* Placeholder */ }
function initPortfolioFilter() { /* Placeholder */ }
function initPortfolioModal() { /* Placeholder */ }
function initTerminalAnimation() { /* Placeholder */ }
function initSkillsAnimation() { /* Placeholder */ }
function initScrollToTop() { /* Placeholder */ }

document.addEventListener('DOMContentLoaded', () => {
  initCustomCursor();
  initScrollAnimations();
  initThemeToggle();
  initMobileMenu();
  initPortfolioFilter();
  initPortfolioModal();
  initTerminalAnimation();
  initSkillsAnimation();
  initScrollToTop();

  resetGlobalAnimationState();
  f35State.mode = 'IDLE';
  window.isIntercepting = false;

  // Ensure F35 elements are queryable, assumed to be in HTML.
  // Create dummy elements if not present and warn, but ideally they are in HTML for styling.
  if (!document.querySelector('.f35')) {
    const f35Div = document.createElement('div'); f35Div.className = 'f35'; document.body.appendChild(f35Div);
    console.warn("'.f35' element was not found in HTML, created a dummy one. Please ensure it exists in your HTML with appropriate styles.");
  }
  if (!document.querySelector('.missile')) {
    const missileDiv = document.createElement('div'); missileDiv.className = 'missile'; document.body.appendChild(missileDiv);
    console.warn("'.missile' element was not found in HTML, created a dummy one. Please ensure it exists in your HTML with appropriate styles.");
  }
  if (!document.querySelector('.explosion')) {
    const explosionDiv = document.createElement('div'); explosionDiv.className = 'explosion'; document.body.appendChild(explosionDiv);
    console.warn("'.explosion' element was not found in HTML, created a dummy one. Please ensure it exists in your HTML with appropriate styles.");
  }

  uavState.lastTimestamp = performance.now();
  runUAVSystem(uavState.lastTimestamp);
});