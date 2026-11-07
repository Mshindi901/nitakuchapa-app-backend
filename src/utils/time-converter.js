export const timeToMilliSeconds = (value, unit) => {
    const multipliers = {
        minutes: 60 * 1000,
        hours: 60 * 60 * 1000,
        days: 24 * 60 * 60 * 1000
    };
    const amount = Number(value);
    if (!Number.isFinite(amount) || amount <= 0 || !multipliers[unit]) {
        throw new Error('A positive interval and valid unit are required');
    }
    return amount * multipliers[unit];
};