from pathlib import Path
import json,base64,statistics
root=Path('.artifacts/performance')
def readreport(file):
 b=file.read_bytes();s=b.decode('utf-16' if b.startswith(b'\xff\xfe') else 'utf-8-sig');s=s.replace('\r\n','\n');i=s.find('{\n  "config"');return json.loads(s[i:] if i>=0 else s)
def measurements(v):
 output={'journeys':[],'initial':[]}
 def walk(suites):
  for suite in suites:
   for spec in suite.get('specs',[]):
    for test in spec['tests']:
     for result in test['results']:
      for a in result.get('attachments',[]):
       if a['name'] in ['navigation-performance','initial-performance']:
        data=json.loads(base64.b64decode(a['body']));output['journeys' if a['name']=='navigation-performance' else 'initial'].append(data)
       elif a['name']=='preview-layout':
        imageRoot=root/'navigation-layouts';imageRoot.mkdir(exist_ok=True)
        name=spec['title'].replace('/','-').replace(':','-').replace(' ','_')+'.png'
        if 'body' in a:(imageRoot/name).write_bytes(base64.b64decode(a['body']))
        elif 'path' in a:(imageRoot/name).write_bytes(Path(a['path']).read_bytes())
   walk(suite.get('suites',[]))
 walk(v['suites']);return output
baseline=measurements(readreport(root/'navigation-baseline.json'))
baseline['initial']=measurements(readreport(root/'initial-baseline.json'))['initial']
finalReport=readreport(root/'navigation-final.log')
(root/'navigation-final.json').write_text(json.dumps(finalReport,indent=2),encoding='utf-8')
final=measurements(finalReport)
technologyReport=readreport(root/'technology-final.log')
(root/'technology-final.json').write_text(json.dumps(technologyReport,indent=2),encoding='utf-8')
latest={}
def outcomes(suites):
 for suite in suites:
  for spec in suite.get('specs',[]):
   for test in spec['tests']:
    latest[(spec['file'],spec['title'],test.get('projectName',''))]=test['results'][-1]['status']
  outcomes(suite.get('suites',[]))
for report in [finalReport,technologyReport]:outcomes(report['suites'])
from collections import Counter
summary={'baseline':baseline,'final':final,'tests':{'primary':finalReport['stats'],'technologyRerun':technologyReport['stats'],'latestUniqueOutcomes':dict(Counter(latest.values()))}}
print('Latest distinct check outcomes:',summary['tests']['latestUniqueOutcomes'])
(root/'navigation-summary.json').write_text(json.dumps(summary,indent=2),encoding='utf-8')
for label,data in [('baseline',baseline),('final',final)]:
 print(label)
 routes={}
 for journey in data['journeys']:
  for t in journey['timings']:routes.setdefault(t['from'].replace('/en','').replace('/ar','')+' -> '+t['to'].replace('/en','').replace('/ar',''),[]).append(t['ms'])
 print('route medians',{k:round(statistics.median(v),1) for k,v in routes.items()})
 tabs={}
 for journey in data['journeys']:
  for t in journey['tabTimings']:tabs.setdefault(t['tab'],[]).append(t.get('clickToPaintMs',t['ms']))
 print('tab medians',{k:round(statistics.median(v),1) for k,v in tabs.items()})
 for entry in data['initial']:
  if entry['locale']=='en':
   print('initial',entry['width'],[(r['route'],round(r['loadMs']),r['lcp'],r['cls'],sum(x['bytes'] for x in r['resources']),sum(x['wireBytes'] for x in r['resources'])) for r in entry['results']])
print('stats',finalReport['stats'])
