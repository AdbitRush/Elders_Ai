"""Publish the games listed in tools/new_games.json (the 2026-10 waves) into the site.

    python tools/build_new_games.py

A game is published only when js/games/<id>.js exists. The script rewrites these marked blocks (and nothing else):
  index.html  <!-- gen:new-game-cards -->  hub section headings + cards (inside #homeScreen, after the original 28)
  index.html  <!-- gen:new-game-list -->   entries in the "All games" list
  index.html  // gen:new-games            window.NEW_GAMES (ids, init, icon, section, skills, why, text)
  sw.js       // gen:new-games            the new game files in the precache list
Everything else (maps, i18n, skills, daily challenge, menu) reads window.NEW_GAMES at run time. Run
tools/build_pages.py afterwards for the landing pages, and tools/preview/card-shots.js + frame_shots.py for card pictures.
"""
import html, json, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REG = json.load(open(os.path.join(ROOT, 'tools', 'new_games.json'), encoding='utf8'))
e = lambda s: html.escape(s, quote=True)


def published():
    return [g for g in REG['games'] if os.path.exists(os.path.join(ROOT, 'js', 'games', g['id'] + '.js'))]


def replace_block(src, start, end, body):
    pat = re.compile(re.escape(start) + r'.*?' + re.escape(end), re.S)
    assert len(pat.findall(src)) == 1, 'marker missing or duplicated: ' + start
    return pat.sub(lambda m: start + body + end, src)


def card(g):
    i = g['id']
    return (f'\n        <div class="premium-card flex flex-col h-full relative" onclick="loadGame(\'{i}\')" style="cursor:pointer;order:99" data-new-game="{i}">'
            f'\n            <span id="hs-{i}" class="hs-badge hidden"></span>'
            f'\n            <div class="thumbnail-container"><img src="images/cards/{i}.jpg" class="thumbnail-img" loading="lazy" decoding="async" alt="" onerror="this.style.cssText+=\';background:linear-gradient(135deg,#7c2d12,#b45309)\'"></div>'
            f'\n            <div class="p-5 flex flex-col flex-grow"><h3 class="text-xl font-bold mb-2 text-gray-800" data-i18n="game_{i}_title">{e(g["title"])}</h3>'
            f'<p class="text-gray-600 flex-grow text-sm" data-i18n="game_{i}_desc">{e(g["desc"])}</p>'
            f'<button class="mt-4 btn-premium py-2.5 rounded-lg font-bold text-sm" onclick="event.stopPropagation();loadGame(\'{i}\')" data-i18n="btn_start">Start Game</button></div>'
            f'\n        </div>')


def main():
    games = published()
    secs = [s for s in REG['sections'] if any(g['section'] == s['key'] for g in games)]
    cards = ''
    for s in secs:
        cards += (f'\n        <div class="w-sec" id="sec-{s["key"]}" style="grid-column:1/-1;order:99" data-sec="{s["key"]}">'
                  f'<h2 class="w-sec-h" data-i18n="sec_{s["key"]}_title">{e(s["title"])}</h2>'
                  f'<p class="w-sec-p" data-i18n="sec_{s["key"]}_sub">{e(s["sub"])}</p></div>')
        cards += ''.join(card(g) for g in games if g['section'] == s['key'])
    lst = ''.join(f'\n    <li data-game="{g["id"]}"><a class="ag-page" href="en/{g["id"]}/">{e(g["title"])}</a> '
                  f'<a class="ag-play" href="?lang=en#{g["id"]}">▶ Play</a></li>' for g in games)
    data = [{'id': g['id'], 'init': g['init'], 'icon': g['icon'], 'section': g['section'], 'skills': g['skills'],
             'why': g['why'], 'title': g['title'], 'desc': g['desc'], 'inst': g['inst']} for g in games]
    sections = [{'key': s['key'], 'title': s['title'], 'sub': s['sub']} for s in secs]
    js = ('\nwindow.NEW_GAMES = ' + json.dumps(data, ensure_ascii=False, separators=(',', ':'))
          + ';\nwindow.NEW_GAME_SECTIONS = ' + json.dumps(sections, ensure_ascii=False, separators=(',', ':'))
          + ';\nwindow.GAME_IDS.push(...window.NEW_GAMES.map(function (g) { return g.id; }));\n')

    p = os.path.join(ROOT, 'index.html'); s = open(p, encoding='utf8').read()
    s = replace_block(s, '<!-- gen:new-game-cards -->', '<!-- /gen:new-game-cards -->', cards + '\n        ')
    s = replace_block(s, '<!-- gen:new-game-list -->', '<!-- /gen:new-game-list -->', lst + '\n    ')
    s = replace_block(s, '// gen:new-games (tools/build_new_games.py; do not edit by hand)', '// /gen:new-games', js)
    open(p, 'w', encoding='utf8', newline='').write(s)

    p = os.path.join(ROOT, 'sw.js'); s = open(p, encoding='utf8').read()
    # game code only: one missing picture would make the whole precache fail
    files = ''.join(f"\n  './js/games/{g['id']}.js'," for g in games)
    s = replace_block(s, '  // gen:new-games', '  // /gen:new-games', files + '\n')
    open(p, 'w', encoding='utf8', newline='').write(s)
    print(f'published {len(games)} new games in {len(secs)} sections:', ' '.join(g['id'] for g in games))


if __name__ == '__main__':
    main()
