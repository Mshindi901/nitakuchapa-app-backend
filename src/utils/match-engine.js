export default function Match_generation(participant, league, interval){
    if(participant.length < 2){
        return 'Atleast two participants needed'
    };
    const players = [...participant];
    if(players.length % 2 !== 0){
        players.push(null);
    };
    const total_rounds = players.length - 1;
    const matches_per_round = players.length /2;
    const rounds = [];
    for (let r = 0; r < total_rounds; r++){
        const matches = []
        for(let i = 0; i < matches_per_round; i++){
            const team_a = players[i];
            const team_b = players[players.length - 1 -i];
            if(team_a && team_b){
                matches.push({team_a: team_a.id, team_b: team_b.id});
            };
        };
        rounds.push(matches);
        const last_team = players.pop();
        players.splice(1, 0, last_team);
    };

    let match_index = 0;
    return rounds.flatMap((fixtures, round_index) => {
        return fixtures.map(fixture => {
            const startTime = new Date(league.start_date).getTime;
            const scheduled_at = new Date(startTime + (match_index * interval));
            match_index ++
            return {
                ...fixture,
                league_id: league.id,
                round: round_index + 1,
                scheduled_at: scheduled_at,
                status: 'pending'
            }
        })
    })
};