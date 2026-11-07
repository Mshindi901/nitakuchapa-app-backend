export default function Match_generation(participants, league, interval) {
    if (!Array.isArray(participants) || participants.length < 2) {
        return [];
    }

    const intervalMilliseconds = Number(interval);
    const startTime = new Date(league.start_date).getTime();
    if (!Number.isFinite(intervalMilliseconds) || intervalMilliseconds <= 0 || !Number.isFinite(startTime)) {
        throw new Error('A valid start date and match interval are required');
    }

    const players = [...participants];
    if (players.length % 2 !== 0) {
        players.push(null);
    }

    const totalRounds = players.length - 1;
    const matchesPerRound = players.length / 2;
    const rounds = [];

    for (let round = 0; round < totalRounds; round += 1) {
        const fixtures = [];
        for (let index = 0; index < matchesPerRound; index += 1) {
            const participantA = players[index];
            const participantB = players[players.length - 1 - index];
            if (participantA && participantB) {
                fixtures.push({
                    participant_a: participantA.id,
                    participant_b: participantB.id,
                });
            }
        }
        rounds.push(fixtures);
        players.splice(1, 0, players.pop());
    }

    return rounds.flatMap((fixtures, roundIndex) => {
        const scheduleAt = new Date(startTime + roundIndex * intervalMilliseconds);
        return fixtures.map((fixture) => ({
            ...fixture,
            league_id: league.id,
            round: roundIndex + 1,
            schedule_at: scheduleAt,
            status: 'pending',
        }));
    });
}
