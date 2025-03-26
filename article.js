import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Initialize Supabase client
const supabaseUrl = 'https://fpvuwegibnwucgxieirp.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwdnV3ZWdpYm53dWNneGllaXJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3MzU2NzEsImV4cCI6MjA1ODMxMTY3MX0.sOmvlv4vjV_EcXze0zYGZSolDst8rg5UqGkc1146Qxw';
const supabase = createClient(supabaseUrl, supabaseKey);

// Fetch all articles from the "Article" table (including the id for linking)
async function fetchArticles() {
  const { data, error } = await supabase
    .from('Article')
    .select('id, image, writer, created_at, title, description, time')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching articles:', error.message);
    return [];
  }
  return data;
}

// Display the latest article in the .latest-article container
function displayLatestArticle(article) {
  const container = document.querySelector('.latest-article');
  if (!container) {
    console.error('Latest article container not found');
    return;
  }

  container.innerHTML = `
    <div class="article-image">
      <div class="image">
        <img src="${article.image}" alt="Latest Article Image">
      </div>
    </div>
    <div class="article-info">
      <div class="time">
        <div class="new">
          <h2>New</h2>
        </div>
        <h2 class="t">${article.time} mins read</h2>
      </div>
      <div class="article-title">
        <h2>${article.title}</h2>
      </div>
      <div class="article-description">
        <h5>${article.description}</h5>
      </div>
      <div class="read-more">
        <h2>Read More</h2>
        <i class="fa-solid fa-arrow-right"></i>
      </div>
    </div>
  `;

  // Attach a click event to the "Read More" area to direct to the article page
  const readMore = container.querySelector('.read-more');
  if (readMore) {
    readMore.addEventListener('click', () => {
      window.location.href = `article_page.html?articleId=${article.id}`;
    });
  }
}

// Display articles inside the container with ID "articles-container"
function displayArticles(articles) {
  const container = document.getElementById('articles-container');
  if (!container) {
    console.error('Articles container element not found');
    return;
  }
  container.innerHTML = ''; // Clear any previous content

  articles.forEach(article => {
    // Format the created date
    const formattedDate = new Date(article.created_at).toLocaleDateString(undefined, {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

    // Create an article card element
    const card = document.createElement('div');
    card.className = 'article-cards';

    card.innerHTML = `
      <div class="article-img">
        <img src="${article.image}" alt="Article Image">
      </div>
      <div class="writer">
        <h2>${article.writer}</h2>
        <h2 class="date">${formattedDate}</h2>
      </div>
      <div class="the-title">
        <h2>${article.title}</h2>
      </div>
      <div class="the-description">
        <h2>${article.description}</h2>
      </div>
      <div class="read-more2">
        <h2>Read More</h2>
        <i class="fa-solid fa-arrow-right"></i>
      </div>
    `;

    // When "Read More" is clicked on this card, navigate to article_page.html with the article's id
    card.querySelector('.read-more2').addEventListener('click', () => {
      window.location.href = `article_page.html?articleId=${article.id}`;
    });

    container.appendChild(card);
  });
}

// On DOM ready, fetch articles and update both containers
document.addEventListener('DOMContentLoaded', async () => {
  const articles = await fetchArticles();

  if (articles.length > 0) {
    // Display the latest article in the .latest-article container
    displayLatestArticle(articles[0]);
    // Display the remaining articles in #articles-container (skip the first)
    displayArticles(articles.slice(1));
  }
});
