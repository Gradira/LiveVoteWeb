function formatUTC() {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const day = String(now.getUTCDate()).padStart(2, '0');
    const hours = String(now.getUTCHours()).padStart(2, '0');
    const minutes = String(now.getUTCMinutes()).padStart(2, '0');
    const seconds = String(now.getUTCSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function timeDiffrString(isoString) {
    const now = new Date();
    const then = new Date(isoString);
    const diffMs = now.getTime() - then.getTime();

    // If in the future, treat as "just now"
    // if (diffMs < 0) return "0s ago";

    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours   = Math.floor(minutes / 60);
    const days    = Math.floor(hours / 24);
    const months  = Math.floor(days / 30);
    const years   = Math.floor(days / 365);

    if (years > 0) return `${years}y ago`;
    if (months > 0) return `${months}mo ago`;
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return `${seconds}s ago`;
}

function get_rank_string(rank, single_char=false, include_point=false) {
    let medal = null;
    if (rank == 1) {
        medal = '🥇';
    } else if (rank == 2) {
        medal = '🥈';
    } else if (rank == 3) {
        medal = '🥉';
    }

    if (medal != null) {
        if (single_char == true)  {
            return medal;
        } else {
            return `${medal} ${rank}`;
        }
    }
    let rank_string = rank.toString();
    if (include_point == true) {
        rank_string += '.'
    }
    return rank_string
}
