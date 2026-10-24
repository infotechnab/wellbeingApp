import { readFileSync } from 'fs';
import { join } from 'path';

import appJson from '../app.json';
import { buildHomePage, renderChangelog } from './build';

describe('renderChangelog', () => {
  it('turns each version into a heading with its paragraphs and lists, leaving out the notes above them', () => {
    const markdown = [
      "# What's new",
      '',
      'Notes for whoever edits this file.',
      '',
      '## 1.1.0',
      '',
      'Smaller fixes.',
      '',
      '- One',
      '- Two that',
      '  carries on',
      '',
      '## 1.0.0',
      '- First',
    ].join('\n');
    expect(renderChangelog(markdown)).toBe(
      '<h3>1.1.0</h3>\n<p>Smaller fixes.</p>\n<ul>\n<li>One</li>\n<li>Two that carries on</li>\n</ul>\n' +
        '<h3>1.0.0</h3>\n<ul>\n<li>First</li>\n</ul>\n',
    );
  });

  it('escapes HTML', () => {
    expect(renderChangelog('## 1.0.0\n- <b>"bold"</b> & more')).toBe(
      '<h3>1.0.0</h3>\n<ul>\n<li>&lt;b&gt;&quot;bold&quot;&lt;/b&gt; &amp; more</li>\n</ul>\n',
    );
  });

  it("has a section for the app's current version", () => {
    const changelog = readFileSync(join(__dirname, '..', 'CHANGELOG.md'), 'utf8');
    expect(renderChangelog(changelog)).toContain(`<h3>${appJson.expo.version}</h3>`);
  });
});

describe('buildHomePage', () => {
  it('fills in every placeholder in site/index.html', () => {
    const template = readFileSync(join(__dirname, 'index.html'), 'utf8');
    const html = buildHomePage(template, { version: '1.0.0', repo: 'owner/repo', whatsNew: '<h3>1.0.0</h3>' });
    expect(html).not.toContain('{{');
    expect(html).toContain('Version 1.0.0');
    expect(html).toContain('href="https://github.com/owner/repo/releases/latest/download/wellbeing.apk"');
    expect(html).toContain('https://api.github.com/repos/owner/repo/releases/latest');
    expect(html).toContain('<h3>1.0.0</h3>');
  });

  it("fails on a placeholder it doesn't know", () => {
    expect(() => buildHomePage('{{NAME}}', { version: '1.0.0', repo: 'owner/repo', whatsNew: '' })).toThrow(
      '{{NAME}}',
    );
  });
});
