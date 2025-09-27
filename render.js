// --- Helper for mapping country code to DOM element ---
const countryElements = {}; // {alpha2: countryFieldElement}

function initCountries() {
    let field_n = 0;

    function createCountryField(alpha2 = "??", hidden = false) {
        const div = document.createElement("div");
        div.className = `country-field${hidden ? ' hidden' : ''}`;
        div.id = `country-field-${field_n}`;
        div.innerHTML = `
            <img class="country-flag" src="/media/flags/${alpha2}.svg">
            <div class="country-info-grid">
                <div class="country-info-top">
                    <p class="country-title">
                    <a class="points-rank">?</a> (<a class="votes-rank">??</a>) <a class="country-code">${alpha2}</a> - <a class="country-name"> ?????????</a>
                    </p>
                </div>
                <div class="country-info-bottom">
                    <p><a class="country-points">??</a> pt</p>
                    <p><a class="country-votes">??</a> vt</p>
                </div>
            </div>
        `;
        return div;
    }

    // Create country fields and store references by country code
    for (let col = 1; col < 4; col++) {
        const column = document.querySelector(`#country-column-${col}`);
        for (let i = 0; i < 20; i++) {
            field_n += 1;
            const el = createCountryField(country_ranking[field_n-1].alpha2, false);
            column.appendChild(el);
        }
    }
    const column = document.querySelector('#country-column-4');
    const topFields = field_n;
    for (let i = 0; i < (country_ranking.length - topFields); i++) {
        field_n += 1;
        const el = createCountryField(country_ranking[field_n-1].alpha2, false);
        column.appendChild(el);
    }

    // Store references by country code for later use
    const allFields = document.querySelectorAll('.country-field');
    allFields.forEach(el => {
        // On init, country code is ??, will be updated later
        const code = el.querySelector('.country-code').innerText;
        countryElements[code] = el;
    });

    countries_initialized = true;
}

// --- Animate moving countries ---
function animateCountryMove(element, fromIndex, toIndex, parent) {
    // Calculate initial position
    const initialRect = element.getBoundingClientRect();
    // Move DOM element to new position
    if (toIndex >= parent.children.length) {
        parent.appendChild(element);
    } else {
        parent.insertBefore(element, parent.children[toIndex]);
    }
    // Force layout to get final position
    const finalRect = element.getBoundingClientRect();
    // Calculate delta
    const deltaY = initialRect.top - finalRect.top;
    // Apply transform to start from old position
    element.style.transition = 'none';
    element.style.transform = `translateY(${deltaY}px)`;
    // Use rAF to trigger transition
    requestAnimationFrame(() => {
        element.style.transition = 'transform 0.5s cubic-bezier(.42,2,.58,.6)';
        element.style.transform = '';
    });
    // Remove transition after animation
    element.addEventListener('transitionend', function handler() {
        element.style.transition = '';
        element.removeEventListener('transitionend', handler);
    });
}

function initUsers() {
    function insertHTML(obj, hidden) {
        obj.insertAdjacentHTML("beforeend", `
            <div class="user-info${hidden ? ' hidden' : ''}" id="user-info-${field_n}">
                <p class="user-ranking"><a class="user-rank">1</a> <a style="font-size: 11px;">Lvl. </a><a class="user-lvl">103</a></p>
                <img class="user-country-flag" src="/media/flags/unknown.svg">
                <p class="user-name">LiveVote User</p>
            </div>
        `);
    }
    let field_n = 0;
    column = document.querySelector('#top-users')
    for (let i = 0; i < 20; i++) {
        field_n += 1;
        insertHTML(column, true);
    }
}

function initLatestVotes() {
    function insertHTML(obj, hidden) {
        obj.insertAdjacentHTML("beforeend", `
            <div class="latest-vote${hidden ? ' hidden' : ''}" id="latest-vote-${field_n}">
                <img class="latest-vote-country-flag" src="/media/flags/unknown.svg">
                <p><a class="latest-vote-points">5,999</a>pt</p>
                <p class="latest-vote-user-name">LiveVote User</p>
            </div>
        `);
    }
    let field_n = 0;
    column = document.querySelector('#latest-votes')
    for (let i = 0; i < 20; i++) {
        field_n += 1;
        insertHTML(column, true);
    }
}

function initLatestEvents() {
    function insertHTML(obj, hidden) {
        obj.insertAdjacentHTML("beforeend", `
            <div class="latest-event${hidden ? ' hidden' : ''}" id="latest-event-${field_n}">
                <img class="latest-event-country-flag" src="/media/flags/unknown.svg">
                <p><a class="latest-event-milestone">6,000</a><a class="latest-event-type">vt</a> for</p>
                <span class="fit-span"></span>
                <p class="latest-event-subject">Utonish</p>
            </div>
        `);
    }
    let field_n = 0;
    column = document.querySelector('#latest-events')
    for (let i = 0; i < 20; i++) {
        field_n += 1;
        insertHTML(column, true);
    }
}

function init() {
    initUsers();
    initLatestVotes();
    initLatestEvents();
}


function animateCounter(counter, newValue) {
    // Parse the current value, or fallback to 0 if not a number
    const start = parseInt(counter.innerHTML.replace(/,/g, "")) || 0;
    const target = newValue;
    const duration = 1000;
    const startTime = performance.now();

    // Glow text function
    function glowText(container) {
        const elements = container.querySelectorAll("*");
        elements.forEach(el => {
            if (el.nodeType === 1 && el.textContent.trim() !== "") {
                el.classList.add("glow");
            }
        });

        setTimeout(() => {
            elements.forEach(el => el.classList.remove("glow"));
        }, 900); // Glow lasts 900ms
    }

    // Only swell if value is increasing
    if (target > start) {
        counter.classList.add('swell');
        // go up 3 parent levels to country-field
        let container = counter;
        for (let i = 0; i < 3; i++) {
            if (container.parentElement) container = container.parentElement;
        }
        glowText(container);
        setTimeout(() => counter.classList.remove('swell'), 900);
    }

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const value = Math.floor(start + (target - start) * progress);
        counter.innerHTML = value.toLocaleString('en-US');

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            counter.innerHTML = target.toLocaleString('en-US');
        }
    }

    requestAnimationFrame(update);
}


let scroll_initialized = false;
function scroll() {
    const container = document.querySelector('#scrollable-column-container');
    const content = container.querySelector('#country-column-4');
    let direction = 1; // 1=down, -1=up
    let scrollY = 0;
    const speed = 40; // px/sec
    const delay = 5000; // 5s in ms
    let isDelaying = true;

    // Calculate heights
    function getHeights() {
      const fullContentHeight = content.scrollHeight;
      const visibleContainerHeight = container.clientHeight;
      return { fullContentHeight, visibleContainerHeight };
    }

    function animateScroll() {
      isDelaying = false;
      let start;
      const { fullContentHeight, visibleContainerHeight } = getHeights();
      const maxScroll = fullContentHeight - visibleContainerHeight;

      function step(timestamp) {
        if (!start) start = timestamp;
        const elapsed = (timestamp - start) / 1000;
        scrollY += direction * speed * (timestamp - start) / 1000;
        start = timestamp;

        // Clamp scroll
        if (direction === 1 && scrollY >= maxScroll) {
          scrollY = maxScroll;
          content.style.transform = `translateY(-${scrollY}px)`;
          setTimeout(() => {
            direction = -1;
            isDelaying = true;
            scrollBack();
          }, delay);
          return;
        } else if (direction === -1 && scrollY <= 0) {
          scrollY = 0;
          content.style.transform = `translateY(-${scrollY}px)`;
          setTimeout(() => {
            direction = 1;
            isDelaying = true;
            scrollForward();
          }, delay);
          return;
        }
        content.style.transform = `translateY(-${scrollY}px)`;
        requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    function scrollForward() {
      setTimeout(() => {
        animateScroll();
      }, delay);
    }
    function scrollBack() {
      setTimeout(() => {
        animateScroll();
      }, delay);
    }

    // Initial delay before starting
    setTimeout(() => {
      animateScroll();
    }, delay);
}

function loopMapViewbox() {
    const svg_tag = document.querySelector('#vote-map').contentDocument.querySelector('svg');
    const viewBoxes = [
        "0 0 2754 1398",     // World
        "1146 92 519 323",   // Europe

        "194 54 965 600",   // North America
        "1691 114 836 520",  // Asia
        "918 343 1094 681",  // Africa
        "354 587 965 600",   // South America
        "1791 531 929 579", // Australia
        "1459 310 438 272",    // Middle East
    ];

    let index = 0;

    setInterval(() => {
        svg_tag.setAttribute("viewBox", viewBoxes[index]);
        index = (index + 1) % viewBoxes.length; // loop back to start
    }, 5000);
}

function getGrayShade(value, exponent = 0.3) {
  const expValue = Math.pow(value, exponent);

  // Interpolate from 34 (#222222) to 255 (#ffffff)
  const gray = Math.round(34 + (255 - 34) * expValue);

  return `rgb(${gray}, ${gray}, ${gray})`;
}

function renderMapUpdate(alpha2, color) {
    const vote_map = document.querySelector('#vote-map')
    const country_g = vote_map.contentDocument.getElementById(alpha2.toLowerCase())

    // Define image URL and desired dimensions

    let top_user = null;
    for (user of user_ranking) {
        if (user.top_country == alpha2) {
            top_user = user;
            break;
        }
    }

    if (top_user != null) {
        const imageUrl = `/cached_media/user_images/${top_user.user_id}.jpg`;
        const imageSize = 50;  // desired width of the image

        // Get bounding box of the SVG element
        const bbox = country_g.getBBox();

        // Calculate coordinates to center the image
        const centerX = bbox.x + bbox.width / 2;
        const centerY = bbox.y + bbox.height / 2;
        const imageX = centerX - imageSize / 2;
        const imageY = centerY - imageSize / 2;

        // Create an SVG <image> element
        const SVG_NS = "http://www.w3.org/2000/svg";
        const imageElement = vote_map.contentDocument.createElementNS(SVG_NS, 'image');

        // Set attributes
        imageElement.setAttributeNS(null, 'href', imageUrl);
        imageElement.setAttributeNS(null, 'width', imageSize);
        imageElement.setAttributeNS(null, 'height', imageSize);
        imageElement.setAttributeNS(null, 'x', imageX);
        imageElement.setAttributeNS(null, 'y', imageY);

        // Append the image element to the SVG element
        country_g.appendChild(imageElement);
    }

    if (country_g == null) {
        return
    }
    country_g.setAttribute('style', `fill:${color};fill-opacity:1`);
    country_g.querySelectorAll("path").forEach(path => { path.setAttribute('style', `fill:${color};fill-opacity:1`); });
}

function renderTotals() {
    document.querySelector('#total-points').innerText = total_points.toLocaleString('en-US');
    document.querySelector('#total-votes').innerText = total_votes.toLocaleString('en-US');
}

function findCountryFieldByCode(code) {
    const fields = document.querySelectorAll('.country-field');
    for (const field of fields) {
        const countryCodeEl = field.querySelector('.country-code');
        if (countryCodeEl && countryCodeEl.innerText.trim() === code) {
            return field;
        }
    }
    return null;
}

function renderCountryRanking() {
    // Build mapping: alpha2 -> country_data
    const newOrder = country_ranking.map(c => c.alpha2);

    function getColumnParent(index) {
        if (index < 20) return document.querySelector('#country-column-1');
        if (index < 40) return document.querySelector('#country-column-2');
        if (index < 60) return document.querySelector('#country-column-3');
        return document.querySelector('#country-column-4');
    }

    // Update all countries (details, points, etc)
    country_ranking.forEach((country_data, index) => {
        const code = country_data.alpha2;
        let el = countryElements[code];

        // If country not yet mapped, find and map
        if (!el) {
            el = findCountryFieldByCode(code);
            if (el) countryElements[code] = el;
        }
        if (!el) return;

        // Update details
        el.querySelector('.country-name').innerText = country_data.name;
        el.querySelector('.country-code').innerText = code;
        el.querySelector('.country-flag').src = `/media/flags/${code}.svg`;

        const f_points_rank = el.querySelector('.points-rank');
        const f_votes_rank = el.querySelector('.votes-rank');
        const f_votes = el.querySelector('.country-votes');
        const f_points = el.querySelector('.country-points');
        const votes_rank = getVoteRank(code);

        const old_points = parseInt(f_points.innerHTML.replace(/,/g, "")) || 0;
        const new_points = country_data.cache.points;
        if (old_points !== new_points) {
            animateCounter(f_points, new_points); // This will animate!
        } else {
            f_points.innerHTML = new_points.toLocaleString('en-US'); // fallback, no change
        }

        f_votes.innerText = country_data.cache.votes.toLocaleString('en-US');
        f_points_rank.innerText = get_rank_string(index + 1);
        f_votes_rank.innerText = votes_rank;

        // Animate counter if needed
        animateCounter(f_points, country_data.cache.points);

        // Color map update
        const unitary_points = country_data.cache.points / country_ranking[0].cache.points;
        renderMapUpdate(country_data.alpha2, getGrayShade(unitary_points));
    });

    // --- Animate/move country fields to new order ---
    // For each column, sort and move elements
    const columns = [
        document.querySelector('#country-column-1'),
        document.querySelector('#country-column-2'),
        document.querySelector('#country-column-3'),
        document.querySelector('#country-column-4'),
    ];

    columns.forEach((parent, colIdx) => {
        // Calculate indices for this column
        let start = colIdx * 20;
        let end = (colIdx === 3) ? country_ranking.length : start + 20;
        const subOrder = country_ranking.slice(start, end).map(c => c.alpha2);

        // Move elements to match order in this column
        subOrder.forEach((code, newIndex) => {
            const el = countryElements[code];
            if (!el) return;
            const currentIndex = Array.from(parent.children).indexOf(el);
            if (currentIndex !== newIndex) {
                animateCountryMove(el, currentIndex, newIndex, parent);
            }
        });
    });
}

function renderUserUpdates() {
    user_ranking.forEach((user_data, index) => {
        let rank = index + 1;
        country_field = document.querySelector(`#user-info-${rank}`);

        if (country_field.classList.contains('hidden')) {
            country_field.classList.remove('hidden')
        }

        f_level = country_field.querySelector('.user-lvl');
        f_name = country_field.querySelector('.user-name');
        f_country_flag = country_field.querySelector('.user-country-flag');
        f_rank = country_field.querySelector('.user-rank');

        const old_user = f_name.innerText;
        const new_user = user_data.username;

        const old_top = f_country_flag.src;
        const new_top = `/media/flags/${user_data.top_country}.svg`;

        f_country_flag.src = `/media/flags/${user_data.top_country}.svg`;

        f_name.innerText = new_user;
        f_rank.innerText = get_rank_string(rank, true, true);

        const new_leveling = Math.floor(user_data.leveling);
        f_level.innerHTML = new_leveling;
    });
}

function renderEventUpdates() {
    latest_events.forEach((event_data, index) => {
        let rank = index + 1;
        event_field = document.querySelector(`#latest-event-${rank}`);

        if (event_field.classList.contains('hidden')) {
            event_field.classList.remove('hidden');
        }

        f_milestone = event_field.querySelector('.latest-event-milestone');
        f_type = event_field.querySelector('.latest-event-type');
        f_span = event_field.querySelector('.fit-span');
        f_name = event_field.querySelector('.latest-event-subject');
        f_country_flag = event_field.querySelector('.latest-event-country-flag');

        if (['country_votes', 'country_points'].includes(event_data.type)) {
            f_country_flag.src = `/media/flags/${event_data.country.alpha2}.svg`;
            f_country_flag.classList.remove('hidden');
            f_span.classList.add('hidden');
            f_name.innerText = event_data.country.name;
            const type = (event_data.type == 'country_votes') ? 'vt' : 'pt';
            f_type.innerText = type;
        } else {
            f_country_flag.classList.add('hidden');
            f_span.classList.remove('hidden');
            f_type.innerText = '. Lvl';
            f_name.innerText = event_data.user.username;
        }
        f_milestone.innerText = event_data.milestone.toLocaleString('en-US');
    });
}

function renderVoteUpdates() {
    latest_votes.forEach((vote, index) => {
        let rank = index + 1;
        vote_field = document.querySelector(`#latest-vote-${rank}`);

        if (vote_field.classList.contains('hidden')) {
            vote_field.classList.remove('hidden')
        }

        f_points = vote_field.querySelector('.latest-vote-points');
        f_name = vote_field.querySelector('.latest-vote-user-name');
        f_country_flag = vote_field.querySelector('.latest-vote-country-flag');

        f_points.innerText = vote.points.toLocaleString('en-US');
        f_name.innerText = vote.user.username;
        f_country_flag.src = `/media/flags/${vote.country.alpha2}.svg`;
    });
}

function renderUpdates() {
    renderCountryRanking();
    renderUserUpdates();
    renderVoteUpdates();
    renderEventUpdates();
    updateLatestVote();
}

function updateLatestVote() {
    if (latest_votes.length == 0) { return }
    const diffr = timeDiffrString(latest_votes[0].timestamp)
    document.querySelector('#latest-update').innerText = diffr
}

async function updateTime() {
    while (true) {
        const formattedTime = formatUTC();
        document.getElementById('current-utc').textContent = formattedTime;

        if (!(latest_votes == null)) {
            updateLatestVote();
        }

        // Wait asynchronously 1 second before next update
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}
