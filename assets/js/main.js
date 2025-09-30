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
        x: 0,
        y: 0,
        velocityX: 0,
        velocityY: 0,
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

    switch (f35State.mode) {
        case 'ENTERING':
            // This runs once to set up the arc path
            const startX = f35State.x;
            const startY = f35State.y;

            // Determine an end point off the opposite side of the screen
            const endX = (startX < window.innerWidth / 2) ? window.innerWidth + 200 : -200;
            const endY = startY + (Math.random() * 100 - 50); // Slight vertical variation

            // Determine a control point to create the "peak" of the arc
            const controlX = window.innerWidth / 2;
            const controlY = Math.min(startY, endY) - (150 + Math.random() * 150); // Arc "upwards"

            // Store the path and progress state
            f35State.arcPath = {
                p0: { x: startX, y: startY },       // Start point
                p1: { x: controlX, y: controlY },   // Bézier control point
                p2: { x: endX, y: endY }            // End point
            };
            f35State.arcProgress = 0; // Represents 't' from 0 to 1 in the Bézier formula

            // Transition to the main flying state
            f35State.mode = 'FLYING_ARC';
            f35State.timeInMode = 0;
            break;

        case 'FLYING_ARC':
            // Fire the missile after a set delay (500ms = ~30 frames at 60fps)
            const FIRING_DELAY_FRAMES = 30;
            if (f35State.timeInMode > FIRING_DELAY_FRAMES && !f35State.hasFired) {
                const targetUAVObject = f35State.uavElement ? uavState.uavs.find(u => u.element === f35State.uavElement) : null;
                if (targetUAVObject && targetUAVObject.alive) {
                    showSystemMessage("FIRING SOLUTION... FOX 3!", 1000);
                    launchMissileFromF35();
                    f35State.hasFired = true;
                }
            }

            // Move the F35 along the predefined arc
            const arcTraversalSpeed = 0.002; // Lower is slower. 1/speed = frames to complete.
            f35State.arcProgress += arcTraversalSpeed;

            // Check if the arc is complete
            if (f35State.arcProgress >= 1) {
                f35State.mode = 'IDLE';
                resetGlobalAnimationState();
                return; // End the update loop for this intercept
            }

            const t = f35State.arcProgress;
            const p0 = f35State.arcPath.p0;
            const p1 = f35State.arcPath.p1;
            const p2 = f35State.arcPath.p2;

            // Calculate current position using the quadratic Bézier formula
            f35State.x = Math.pow(1 - t, 2) * p0.x + 2 * (1 - t) * t * p1.x + Math.pow(t, 2) * p2.x;
            f35State.y = Math.pow(1 - t, 2) * p0.y + 2 * (1 - t) * t * p1.y + Math.pow(t, 2) * p2.y;
            
            // Calculate the angle using the derivative of the Bézier curve for a smooth tangent
            const dx_dt = 2 * (1 - t) * (p1.x - p0.x) + 2 * t * (p2.x - p1.x);
            const dy_dt = 2 * (1 - t) * (p1.y - p0.y) + 2 * t * (p2.y - p1.y);
            f35State.angle = Math.atan2(dy_dt, dx_dt) * 180 / Math.PI;

            // Apply the new position and rotation to the element
            f35State.element.style.left = `${f35State.x - f35State.element.offsetWidth / 2}px`;
            f35State.element.style.top = `${f35State.y - f35State.element.offsetHeight / 2}px`;
            f35State.element.style.transform = `rotate(${f35State.angle}deg) ${f35State.spriteMirrorX ? 'scaleX(-1)' : 'scaleX(1)'}`;
            break;
            
        case 'DISENGAGING': // Reroute any stray calls to this state to the main arc logic
            if (!f35State.arcPath) {
                // If somehow called without an arc path, just exit gracefully
                f35State.mode = 'IDLE';
                resetGlobalAnimationState();
                return;
            }
            f35State.mode = 'FLYING_ARC';
            break;

        default: // If in an unknown state, reset and go idle
            f35State.mode = 'IDLE';
            resetGlobalAnimationState();
            return;
    }

    // Continue the animation loop if not yet idle
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
    
    // **FIX**: Initialize position in our JavaScript state
    f35State.missileFlightState.x = f35State.x + (noseOffsetFactor * Math.cos(f35AngleRad)) - missileWidth / 2;
    f35State.missileFlightState.y = f35State.y + (noseOffsetFactor * Math.sin(f35AngleRad)) - missileHeight / 2;

    // Set the initial visual position from our state
    missile.style.left = `${f35State.missileFlightState.x}px`;
    missile.style.top = `${f35State.missileFlightState.y}px`;
    
    // Initialize missile state - inherit F35's velocity initially
    f35State.missileFlightState.currentAngleDeg = f35State.angle;
    f35State.missileFlightState.speed = f35State.speed * 0.8; // Start with most of F35's speed
    f35State.missileFlightState.velocityX = Math.cos(f35AngleRad) * f35State.missileFlightState.speed;
    f35State.missileFlightState.velocityY = Math.sin(f35AngleRad) * f35State.missileFlightState.speed;
    f35State.missileFlightState.framesSinceLaunch = 0;
    f35State.missileFlightState.homingActive = false;
    
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
        // **FIX**: Read from JS state, not DOM, for smoke trail position
        if (missile.style.opacity === '0' || !window.isIntercepting) {
            clearInterval(smokeIntervalId); smokeIntervalId = null; return;
        }
        const smokeTrail = document.createElement('div');
        smokeTrail.className = 'smoke-trail';
        const trailAngleRad = (f35State.missileFlightState.currentAngleDeg || 0) * Math.PI / 180;
        const mWidth = missile.offsetWidth || 50;
        const mHeight = missile.offsetHeight || 10;
        smokeTrail.style.left = `${f35State.missileFlightState.x + mWidth / 2 - 5 - Math.cos(trailAngleRad) * (mWidth * 0.55)}px`;
        smokeTrail.style.top = `${f35State.missileFlightState.y + mHeight / 2 - 5 - Math.sin(trailAngleRad) * (mWidth * 0.55)}px`;
        document.body.appendChild(smokeTrail);
        smokeTrail.addEventListener('animationend', () => { if (smokeTrail.parentNode) smokeTrail.remove(); });
    }, 50);

    let hitOccurred = false;
    const MAX_MISSILE_FLIGHT_FRAMES = 800;
    
    // Missile behavior constants
    const DROP_FRAMES = 8; // Frames to drop before booster ignites
    const DROP_GRAVITY = 0.15; // Downward acceleration during drop
    const BOOSTER_ACCELERATION = 0.3; // Acceleration per frame when booster active
    const MAX_MISSILE_SPEED = 8.0; 
    const HOMING_TURN_RATE = 1.5; // Degrees per frame

    function animateMissileFlight() {
        if (hitOccurred || !window.isIntercepting) {
            if (missileAnimFrameId) cancelAnimationFrame(missileAnimFrameId); missileAnimFrameId = null;
            if (!hitOccurred && missile) missile.style.opacity = '0';
            if (smokeIntervalId) { clearInterval(smokeIntervalId); smokeIntervalId = null; }
            return;
        }
        
        f35State.missileFlightState.framesSinceLaunch++;
        const frameCount = f35State.missileFlightState.framesSinceLaunch;

        const targetUAVObject = f35State.uavElement ? uavState.uavs.find(u => u.element === f35State.uavElement) : null;
        if (!targetUAVObject || !targetUAVObject.alive || !targetUAVObject.element || 
            targetUAVObject.element.style.opacity === '0' || !targetUAVObject.element.parentNode) {
            if (hitOccurred) return;
            hitOccurred = true;
            if (missileAnimFrameId) cancelAnimationFrame(missileAnimFrameId); missileAnimFrameId = null;
            if (missile) missile.style.opacity = '0';
            if (smokeIntervalId) { clearInterval(smokeIntervalId); smokeIntervalId = null; }
            showSystemMessage("UAV LOST MID-FLIGHT (MISSILE)", 2000);
            return;
        }
        
        // **FIX START**: Entire logic is now based on JS state, not DOM reads
        const missileWidth = missile.offsetWidth || 50;
        const missileHeight = missile.offsetHeight || 10;
        const currentMissileCenterX = f35State.missileFlightState.x + missileWidth / 2;
        const currentMissileCenterY = f35State.missileFlightState.y + missileHeight / 2;

        // Phase 1: Drop phase (frames 0-DROP_FRAMES)
        if (frameCount <= DROP_FRAMES) {
            f35State.missileFlightState.velocityY += DROP_GRAVITY;
            const speedLoss = 0.95;
            f35State.missileFlightState.velocityX *= speedLoss;
            f35State.missileFlightState.velocityY *= speedLoss;
        } 
        // Phase 2: Booster ignition and homing
        else {
            if (!f35State.missileFlightState.homingActive) {
                f35State.missileFlightState.homingActive = true;
                f35State.missileFlightState.speed = Math.sqrt(
                    f35State.missileFlightState.velocityX ** 2 + 
                    f35State.missileFlightState.velocityY ** 2
                );
            }

            const uavCurrentRect = targetUAVObject.element.getBoundingClientRect();
            const targetX = uavCurrentRect.left + uavCurrentRect.width / 2;
            const targetY = uavCurrentRect.top + uavCurrentRect.height / 2;

            const dxToTarget = targetX - currentMissileCenterX;
            const dyToTarget = targetY - currentMissileCenterY;
            const angleToTargetDeg = Math.atan2(dyToTarget, dxToTarget) * 180 / Math.PI;

            let angleDiff = angleToTargetDeg - f35State.missileFlightState.currentAngleDeg;
            while (angleDiff > 180) angleDiff -= 360;
            while (angleDiff < -180) angleDiff += 360;
            
            const turnAmount = Math.max(-HOMING_TURN_RATE, Math.min(HOMING_TURN_RATE, angleDiff));
            f35State.missileFlightState.currentAngleDeg = (f35State.missileFlightState.currentAngleDeg + turnAmount + 360) % 360;

            f35State.missileFlightState.speed = Math.min(
                MAX_MISSILE_SPEED, 
                f35State.missileFlightState.speed + BOOSTER_ACCELERATION
            );

            const angleRad = f35State.missileFlightState.currentAngleDeg * Math.PI / 180;
            f35State.missileFlightState.velocityX = Math.cos(angleRad) * f35State.missileFlightState.speed;
            f35State.missileFlightState.velocityY = Math.sin(angleRad) * f35State.missileFlightState.speed;
        }

        // Apply velocity to our state's position
        f35State.missileFlightState.x += f35State.missileFlightState.velocityX;
        f35State.missileFlightState.y += f35State.missileFlightState.velocityY;
        
        // Render the missile's new position from our state
        missile.style.left = `${f35State.missileFlightState.x}px`;
        missile.style.top = `${f35State.missileFlightState.y}px`;
        
        const visualAngle = Math.atan2(f35State.missileFlightState.velocityY, f35State.missileFlightState.velocityX) * 180 / Math.PI;
        missile.style.transform = `rotate(${visualAngle}deg) ${f35State.missileFlightState.spriteMirrorX ? 'scaleX(-1)' : 'scaleX(1)'}`;
        // **FIX END**

        // Check for collision
        const uavCurrentRect = targetUAVObject.element.getBoundingClientRect();
        if (missile.style.opacity !== '0' &&
            (f35State.missileFlightState.x + missileWidth) > uavCurrentRect.left &&
            f35State.missileFlightState.x < uavCurrentRect.right &&
            (f35State.missileFlightState.y + missileHeight) > uavCurrentRect.top &&
            f35State.missileFlightState.y < uavCurrentRect.bottom) {

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
            const targetMissileX = uavCurrentRect.left + uavCurrentRect.width / 2;
            const targetMissileY = uavCurrentRect.top + uavCurrentRect.height / 2;
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

        // Timeout check
        if (frameCount > MAX_MISSILE_FLIGHT_FRAMES && !hitOccurred) {
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
            f35State.targetBracketsElement.remove();
            f35State.targetBracketsElement = null;
        }
    }
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
        document.body.appendChild(tb);
      }
      f35State.targetBracketsElement = tb;
      f35State.targetBracketsElement.style.animation = 'targetLock 0.75s ease-out forwards';
  }

  f35State.targetBracketsElement.style.opacity = '1';
  const uavLiveRect = f35State.uavElement.getBoundingClientRect();
  if (uavLiveRect.width === 0 && uavLiveRect.height === 0) {
      f35State.targetBracketsElement.style.opacity = '0';
      targetBracketsAnimFrameId = requestAnimationFrame(updateTargetBracketsPosition);
      return;
  }

  const scrollX = window.scrollX || window.pageXOffset;
  const scrollY = window.scrollY || window.pageYOffset;

  const bracketWidth = uavLiveRect.width * 0.4;
  const bracketHeight = uavLiveRect.height * 0.9;
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