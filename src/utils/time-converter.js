export const timeToMilliSeconds = (value, unit) => {
    const multipliers = {
        minutes: 60 * 1000,
        hours: 60 * 60 * 1000,
        days: 24 * 60 * 60 * 1000 
    };
    return Number(value) * multipliers[unit];
};