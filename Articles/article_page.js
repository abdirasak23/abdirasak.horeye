import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Initialize Supabase client
const supabaseUrl = 'https://fpvuwegibnwucgxieirp.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwdnV3ZWdpYm53dWNneGllaXJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3MzU2NzEsImV4cCI6MjA1ODMxMTY3MX0.sOmvlv4vjV_EcXze0zYGZSolDst8rg5UqGkc1146Qxw';
const supabase = createClient(supabaseUrl, supabaseKey);




// Helper: Get articleId from URL query parameter
function getArticleIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

// Function to create URL-friendly slug from title
function createSlug(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')    // strip out special chars
    .replace(/[\s_-]+/g, '-')    // spaces/underscores → hyphens
    .replace(/^-+|-+$/g, '');    // trim leading/trailing hyphens
}

// Function to generate the full article URL
function generateArticleUrl(title, id) {
  const slug = createSlug(title);
  const base =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
      ? `${window.location.protocol}//${window.location.host}`
      : 'https://www.horeye.me';
  return `${base}/Articles/?article=${slug}&id=${id}`;
}


// Fetch a single article by its ID
async function fetchArticleById(id) {
  const { data, error } = await supabase
    .from('Article')
    .select('id, image, writer, created_at, title, description, time')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching article:', error.message);
    return null;
  }
  return data;
}

// Fetch all articles (to later display as "other articles")
async function fetchAllArticles() {
  const { data, error } = await supabase
    .from('Article')
    .select('id, image, writer, created_at, title, description, time')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all articles:', error.message);
    return [];
  }
  return data;
}

// Helper function to format article text into multiple paragraphs
function formatArticleText(text) {
  const paragraphs = text
    .split(/\r?\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 0);

  return paragraphs.map(p => {
    const wrapper = document.createElement('div');
    wrapper.textContent = p;           // safely escape HTML
    return `<p>${wrapper.innerHTML}</p>`;
  }).join('');
}


// Display the main article using the provided containers in the HTML
function displayMainArticle(article) {

  document.title = article.title;

  // Main image container
  const imageContainer = document.querySelector('.article-image');
  if (imageContainer) {
    imageContainer.innerHTML = `<img src="${article.image}" alt="Article Image">`;
  }

  // Title bar container
  const titleBar = document.querySelector('.title-bar .title');
  if (titleBar) {
    titleBar.innerHTML = `<h2>${article.title}</h2>`;
  }

  // Author container (including writer and reading time)
  const authorContainer = document.querySelector('.author .name');
  if (authorContainer) {
    const formattedDate = new Date(article.created_at).toLocaleDateString(undefined, {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    authorContainer.innerHTML = `
      <h2>Author: <span>${article.writer}</span></h2>
      <li>${article.time} min read</li>
      <div class="date"><h2>${formattedDate}</h2></div>
    `;
  }

  // Article content container (the article's full text)
  const articleBar = document.querySelector('.the-article .article-bar');
if (articleBar && article.description) {
  articleBar.innerHTML = formatArticleText(article.description);
}
}

// Display "other" articles (all articles except the main one) in the .latest-articles container
function displayOtherArticles(articles, mainArticleId) {
  const container = document.querySelector('.latest-articles');
  if (!container) {
    console.error('Latest articles container not found');
    return;
  }
  // Start with a header
  container.innerHTML = `<div class="heads"><h2>My Articles</h2></div>`;

  articles.forEach(article => {
    if (article.id === mainArticleId) return; // Skip the main article

    const card = document.createElement('div');
    card.className = 'other';

    card.innerHTML = `
      <div class="image">
        <img src="${article.image}" alt="Other Article Image">
      </div>
      <div class="my-article-title">
        <h2>${article.title}</h2>
      </div>
    `;

    // Make each other article clickable to navigate to its own page
    card.addEventListener('click', () => {
      window.location.href = generateArticleUrl(article.title, article.id);
    });

    container.appendChild(card);
  });
}

// Setup social sharing functionality by attaching event listeners to each icon
function setupSocialSharing() {
  // Use the current URL (which should include the articleId query parameter)
  const url = encodeURIComponent(window.location.href);
  // Get the title from the article title element if available
  const titleElement = document.querySelector('.title-bar .title h2');
  const titleText = titleElement ? encodeURIComponent(titleElement.innerText) : '';

  // For each social icon container, add a click event based on its inner icon class
  const socialButtons = document.querySelectorAll('.social .soc');
  socialButtons.forEach(button => {
    const icon = button.querySelector('i');
    if (!icon) return;
    if (icon.classList.contains('fa-square-facebook')) {
      button.addEventListener('click', () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
      });
    } else if (icon.classList.contains('fa-square-x-twitter')) {
      button.addEventListener('click', () => {
        window.open(`https://twitter.com/intent/tweet?url=${url}&text=${titleText}`, '_blank');
      });
    } else if (icon.classList.contains('fa-square-whatsapp')) {
      button.addEventListener('click', () => {
        window.open(`https://api.whatsapp.com/send?text=${titleText}%20${url}`, '_blank');
      });
    } else if (icon.classList.contains('fa-share-nodes')) {
      button.addEventListener('click', () => {
        if (navigator.share) {
          navigator.share({
            title: titleText,
            url: window.location.href,
          });
        } else {
          alert('Share functionality is not supported in your browser.');
        }
      });
    }
  });
}

// When the DOM is ready, fetch and display the clicked article and the list of other articles
document.addEventListener('DOMContentLoaded', async () => {
  const articleId = getArticleIdFromUrl();
  if (!articleId) {
    console.error('No articleId provided in URL');
    return;
  }

  // Fetch and display the main (clicked) article
  const mainArticle = await fetchArticleById(articleId);
  if (mainArticle) {
    displayMainArticle(mainArticle);
  }

  // Fetch all articles and display the other articles (excluding the main one)
  const allArticles = await fetchAllArticles();
  displayOtherArticles(allArticles, mainArticle.id);

  // Setup social sharing functionality after article details are displayed
  setupSocialSharing();
});
