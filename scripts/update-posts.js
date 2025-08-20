const Parser = require('rss-parser');
const { JSDOM } = require('jsdom');
const fs = require('fs');

const parser = new Parser();

const substackUrl = 'https://vijayanant.substack.com/feed';
const outputFile = 'index.html';

(async () => {
  try {
    const feed = await parser.parseURL(substackUrl);
    const posts = feed.items.slice(0, 3).map(item => {
      return {
        title: item.title,
        link: item.link,
        pubDate: new Date(item.pubDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        description: item.contentSnippet.slice(0, 150) + '...',
      };
    });

    const dom = await JSDOM.fromFile(outputFile);
    const document = dom.window.document;
    const writingGrid = document.querySelector('.writing-grid');

    writingGrid.innerHTML = '';

    posts.forEach(post => {
      const postElement = document.createElement('div');
      postElement.classList.add('writing-item');
      postElement.innerHTML = `
        <h3 class="writing-title"><a href="${post.link}" target="_blank" rel="noopener noreferrer">${post.title}</a></h3>
        <p class="writing-meta"><span>${post.pubDate}</span></p>
        <p class="writing-description">${post.description}</p>
        <a href="${post.link}" class="read-more-button" target="_blank" rel="noopener noreferrer">Read More &rarr;</a>
      `;
      writingGrid.appendChild(postElement);
    });

    fs.writeFileSync(outputFile, dom.serialize());
    console.log('Successfully updated posts!');
  } catch (error) {
    console.error('Error updating posts:', error);
  }
})();
