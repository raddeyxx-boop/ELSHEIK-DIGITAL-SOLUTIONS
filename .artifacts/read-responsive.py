import pathlib,json,base64
s=pathlib.Path('.artifacts/responsive-baseline.log').read_text(encoding='utf-16').replace('\r\n','\n')
j=json.loads(s[s.index('{\n  "config"'):])
rows=[(sp['title'],json.loads(base64.b64decode(a['body']))) for su in j['suites'] for sp in su['specs'] for t in sp['tests'] for r in t['results'] for a in r['attachments'] if a['name']=='geometry']
pathlib.Path('.artifacts/responsive-baseline.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf8')
for title,rs in rows:
    issues=[(r['route'],r['clipped']) for r in rs if r['clipped']]
    if issues: print(title, json.dumps(issues,ensure_ascii=True))
