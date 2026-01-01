const DIFFICULTY = "easy"
const DIFFICULTY_BIAS = {
    easy: 0.8,
    medium: 0.5,
    hard: 0.3,
    realistic: 0.2
};

export const stingometer = (min, max) => {
    const bias = DIFFICULTY_BIAS[DIFFICULTY];
    const biased = Math.pow(Math.random(), 1 / bias);
    return Math.round(min + biased * (max - min));
}