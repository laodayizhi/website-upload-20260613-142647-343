
(function () {
    const input = document.getElementById('global-search-input');
    const categorySelect = document.getElementById('global-category-select');
    const typeSelect = document.getElementById('global-type-select');
    const results = document.getElementById('search-results');
    const status = document.getElementById('search-status');
    const movies = Array.isArray(window.MOVIE_INDEX) ? window.MOVIE_INDEX : [];
    const params = new URLSearchParams(window.location.search);

    if (!input || !categorySelect || !typeSelect || !results || !status) {
        return;
    }

    input.value = params.get('q') || '';

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function renderMovie(movie) {
        return `
            <article class="movie-card" data-card>
                <a class="movie-poster" href="${escapeHtml(movie.url)}" aria-label="观看 ${escapeHtml(movie.title)}">
                    <img src="${escapeHtml(movie.cover)}" alt="${escapeHtml(movie.title)}" loading="lazy">
                    <span class="category-pill">${escapeHtml(movie.category)}</span>
                    <span class="play-float">▶</span>
                </a>
                <div class="movie-card-body">
                    <h3><a href="${escapeHtml(movie.url)}">${escapeHtml(movie.title)}</a></h3>
                    <p>${escapeHtml(movie.oneLine)}</p>
                    <div class="movie-meta">
                        <span>${escapeHtml(movie.year)}</span>
                        <span>${escapeHtml(movie.region)}</span>
                        <span>${escapeHtml(movie.rawType || movie.type)}</span>
                    </div>
                </div>
            </article>
        `;
    }

    function applySearch() {
        const query = normalize(input.value);
        const category = categorySelect.value;
        const type = typeSelect.value;

        const filtered = movies.filter(function (movie) {
            const haystack = normalize([
                movie.title,
                movie.oneLine,
                movie.region,
                movie.year,
                movie.genre,
                movie.category,
                movie.rawType,
                movie.type,
                Array.isArray(movie.tags) ? movie.tags.join(' ') : ''
            ].join(' '));

            const matchesQuery = !query || haystack.includes(query);
            const matchesCategory = category === '全部' || movie.category === category;
            const matchesType = type === '全部' || movie.type === type;

            return matchesQuery && matchesCategory && matchesType;
        });

        const limited = filtered.slice(0, 240);
        results.innerHTML = limited.map(renderMovie).join('');

        if (filtered.length > limited.length) {
            status.textContent = `找到 ${filtered.length} 部影片，当前显示前 ${limited.length} 部。请继续输入关键词缩小范围。`;
        } else {
            status.textContent = `找到 ${filtered.length} 部影片。`;
        }
    }

    input.addEventListener('input', applySearch);
    categorySelect.addEventListener('change', applySearch);
    typeSelect.addEventListener('change', applySearch);

    applySearch();
}());
