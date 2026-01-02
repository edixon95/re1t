export const soundEvents = [];

export const emitSound = (position, radius, duration = 0.2) => {
    soundEvents.push({
        position: position.clone(),
        radius,
        timeLeft: duration,
    });
}

export const updateSounds = (delta) => {
    for (let i = soundEvents.length - 1; i >= 0; i--) {
        soundEvents[i].timeLeft -= delta;
        if (soundEvents[i].timeLeft <= 0) {
            soundEvents.splice(i, 1);
        }
    }
}
