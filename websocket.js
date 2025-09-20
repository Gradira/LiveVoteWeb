const ws_link = 'ws://localhost:6789';

function updateCountry(alpha2, points, votes) {
  const country = country_ranking.find(c => c.alpha2 === alpha2);

  if (!country) {
    console.warn(`Country with code ${alpha2} not found`);
    return;
  }

  country.cache.points = points;
  country.cache.votes = votes;
}

function updateUser(user_id, leveling, total_points, total_votes) {
  const user = user_ranking.find(u => u.user_id === user_id);

  if (!user) {
    console.warn(`User with ID ${user_id} not found`);
    return;
  }

  user.leveling = leveling;
  user.total_points = total_points;
  user.total_votes = total_votes;
}

function updateRanking() {
    country_ranking.sort((a, b) => {
        if (b.points === a.points) {
            return b.votes - a.votes;
        }
        return b.points - a.points;
    });
    user_ranking.sort((a, b) => { if (b.votes === a.votes) { return b.leveling - a.leveling; } return a; });
}

function getVoteRank(alpha2) {
    // Sort countries by votes descending, points as tiebreaker
    const voteSorted = [...country_ranking].sort((a, b) => {
        if (b.votes === a.votes) {
            return b.points - a.points;
        }
        return b.votes - a.votes;
    });
    const rank = voteSorted.findIndex(c => c.alpha2 === alpha2);
    return rank === -1 ? null : rank + 1;
}

function recalcTotals() {
    country_ranking.forEach(entry => {
        total_points += entry.cache.points;
        total_votes += entry.cache.votes;
    });

    return {
        total_points,
        total_votes
    };
}


function processEvent(event) {
    data = JSON.parse(event.data);
    console.log(data);
    if (data.type == 'status') {
        country_ranking = data.country_ranking;
        user_ranking = data.user_ranking;
        latest_votes = data.latest_votes;
        latest_events = data.latest_events;
        renderUpdates();
        updateLatestVote();

        total_votes = 0;
        total_points = 0;
        recalcTotals();
        renderTotals();

    } else if (data.type == 'update') {
        if (data.vote.redacted) {
            return;
        }

        latest_votes.unshift(data.vote);
        if (latest_votes.length > 20) {
            latest_votes.pop();
        }
        updateLatestVote();

        total_votes += data.vote.vote_count;
        total_points += data.vote.points;
        renderTotals();

        latest_events.unshift(...data.events.slice().reverse());
        if (latest_events.length > 20) {
            latest_events.length = 20;
        }

        updateCountry(data.vote.country.alpha2, data.vote.country.cache.points, data.vote.country.cache.votes);
        updateRanking();
        renderUpdates();
    } else {
        console.error('Unknown data type ' + data.type);
    }
}

function loadWebSocket() {
    console.log('WebSocket link: ' + ws_link);
    console.log('Connecting to WebSocket...');

    const ws = new WebSocket(ws_link);

    ws.onopen = () => {
        console.log('Successfully connected to WebSocket.');
        endConnecting();
    }; ws.onerror = (error) => {
        console.error('Failed to connect to WebSocket:', error);
        endConnecting();
        enableWebSocketError();
    }; ws.onclose = (event) => {
        if (!event.wasClean) {
            console.error(`WebSocket connection closed unexpectedly (code: ${event.code}, reason: ${event.reason})`);
        } else {
            console.log('WebSocket connection closed cleanly.');
        }
        enableWebSocketError();
    }; ws.onmessage = (event) => {
        processEvent(event);
    };
}

function endConnecting() {
    document.querySelector('#connecting').classList.add('hidden')
    document.querySelector('#site-content').classList.remove('hidden')
}

function enableWebSocketError() {
    document.querySelector('#ws-link').innerText = ws_link
    document.querySelector('#connection-failed').classList.remove('hidden')
    document.querySelector('#site-content').classList.add('hidden')
}
