/**
 * Builds the app's home page: fills site/index.html with the version from app.json and the
 * "What's new" list from CHANGELOG.md, and copies the icons next to it. The website workflow runs it
 * after exporting the web app into <out>/app:
 *
 *   node site/build.js dist
 */
const fs = require('fs');
const path = require('path');

const escapeHtml = (text) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * CHANGELOG.md as HTML: each "## version" heading with its paragraphs and "- " lists. Anything before
 * the first heading is a note for whoever edits the file, so it's left out. All text is escaped.
 */
function renderChangelog(markdown) {
  const blocks = [];
  for (const raw of markdown.split('\n')) {
    const line = raw.trim();
    const last = blocks[blocks.length - 1];
    if (line.startsWith('## ')) blocks.push({ type: 'h3', text: line.slice(3) });
    else if (!blocks.length) continue;
    else if (!line) blocks.push({ type: 'gap' });
    else if (line.startsWith('- ')) blocks.push({ type: 'li', text: line.slice(2) });
    // A line that carries on the paragraph or list item above it.
    else if (last.type === 'p' || last.type === 'li') last.text += ` ${line}`;
    else blocks.push({ type: 'p', text: line });
  }

  let html = '';
  let inList = false;
  for (const block of blocks) {
    if (inList && block.type !== 'li') {
      html += '</ul>\n';
      inList = false;
    }
    if (block.type === 'li' && !inList) {
      html += '<ul>\n';
      inList = true;
    }
    if (block.type !== 'gap') html += `<${block.type}>${escapeHtml(block.text)}</${block.type}>\n`;
  }
  return inList ? `${html}</ul>\n` : html;
}

/** The page with its {{PLACEHOLDERS}} filled in. Fails on any placeholder it doesn't know. */
function buildHomePage(template, { version, repo, whatsNew }) {
  const values = { VERSION: escapeHtml(version), REPO: repo, WHATS_NEW: whatsNew };
  return template.replace(/\{\{(\w+)\}\}/g, (match, name) => {
    if (!(name in values)) throw new Error(`site/index.html: unknown placeholder ${match}`);
    return values[name];
  });
}

function main(outDir) {
  if (!outDir) throw new Error('Usage: node site/build.js <out-dir>');
  const root = path.join(__dirname, '..');
  const html = buildHomePage(fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8'), {
    version: JSON.parse(fs.readFileSync(path.join(root, 'app.json'), 'utf8')).expo.version,
    repo: process.env.GITHUB_REPOSITORY || 'infotechnab/wellbeingApp',
    whatsNew: renderChangelog(fs.readFileSync(path.join(root, 'CHANGELOG.md'), 'utf8')),
  });
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'index.html'), html);
  fs.copyFileSync(path.join(__dirname, 'icon.png'), path.join(outDir, 'icon.png'));
  fs.copyFileSync(path.join(root, 'assets/images/favicon.png'), path.join(outDir, 'favicon.png'));
}

module.exports = { buildHomePage, renderChangelog };

if (require.main === module) main(process.argv[2]);
