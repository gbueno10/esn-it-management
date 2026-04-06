# -*- coding: utf-8 -*-
import json, re

with open('/Users/gbuenos/Projetos Local/ESN/esn-it-manager/data/event-teams-analytics.json') as f:
    data = json.load(f)

# Full members list from Supabase
members_raw = json.loads(open('/Users/gbuenos/Projetos Local/ESN/esn-it-manager/scripts/members.json').read())
members = {m['name']: m['id'] for m in members_raw if m.get('name')}

# Manual overrides
MANUAL = {
    'Bueno': 'Gabriel Bueno',
    'Carol Bessil': 'Carolina Bessil',
    'Rosa Fraz\u00e3o': 'Maria Rosa Fraz\u00e3o',
    'Giovana Fargnoli': 'Giovanna Fargnoli',
    'Maur\u00edllio Mestre': 'Maurilio Mestre',
    'Leonor Freire': 'Leonor Costa',
    'Pablo Naranjo': 'Pablo Vera',
    'MJ Soares': 'Maria Jo\u00e3o Soares',
    'Andreia Pereira': 'Andreia Ad\u00e3o',
    'Mara Patricio': 'Mara Patr\u00edcio',
    'Luca Rosolem': 'Luca de Castro Rosolem',
}

def normalize(name):
    s = name.lower().strip()
    for k, v in {'\u00e1':'a','\u00e0':'a','\u00e3':'a','\u00e2':'a','\u00e9':'e','\u00ea':'e','\u00ed':'i',
                 '\u00f3':'o','\u00f4':'o','\u00f5':'o','\u00fa':'u','\u00fc':'u','\u00e7':'c','\u00f1':'n'}.items():
        s = s.replace(k, v)
    return re.sub(r'\s+', ' ', s)

def name_parts(name):
    return set(normalize(name).split())

# Get all raw names
all_raw = set()
for v in data['leaderboard']:
    all_raw.add(v['name'])
    all_raw.update(v['aliases'])

# Build mapping
name_to_member = {}
for raw in all_raw:
    if raw in MANUAL:
        canonical = MANUAL[raw]
        if canonical and canonical in members:
            name_to_member[raw] = {'member_id': members[canonical], 'canonical_name': canonical}
        continue

    norm = normalize(raw)
    rparts = name_parts(raw)
    best, best_score = None, 0

    for mname, mid in members.items():
        mnorm = normalize(mname)
        mparts = name_parts(mname)
        if norm == mnorm:
            best, best_score = (mname, mid), 10
            break
        r_split, m_split = norm.split(), mnorm.split()
        if not r_split or not m_split:
            continue
        first_match = r_split[0] == m_split[0]
        last_match = r_split[-1] == m_split[-1]
        if first_match and last_match and len(r_split) >= 2 and len(m_split) >= 2:
            if 5 > best_score:
                best, best_score = (mname, mid), 5
        if first_match and (rparts.issubset(mparts) or mparts.issubset(rparts)):
            if 4 > best_score:
                best, best_score = (mname, mid), 4

    if best and best_score >= 4:
        name_to_member[raw] = {'member_id': best[1], 'canonical_name': best[0]}

# Update leaderboard
for v in data['leaderboard']:
    match = name_to_member.get(v['name'])
    if not match:
        for a in v['aliases']:
            match = name_to_member.get(a)
            if match:
                break
    if match:
        v['matched'] = True
        v['member_id'] = match['member_id']
        old = v['name']
        if old != match['canonical_name']:
            v['name'] = match['canonical_name']
            if old not in v['aliases']:
                v['aliases'].append(old)
    else:
        v['matched'] = False
        v['member_id'] = None

matched = sum(1 for v in data['leaderboard'] if v['matched'])
unmatched = sum(1 for v in data['leaderboard'] if not v['matched'])
data['summary']['matched_to_members'] = matched
data['summary']['unmatched'] = unmatched

with open('/Users/gbuenos/Projetos Local/ESN/esn-it-manager/data/event-teams-analytics.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"Matched: {matched}, Unmatched: {unmatched}")
print(f"\nStill unmatched:")
for v in sorted(data['leaderboard'], key=lambda x: x['name']):
    if not v['matched']:
        print(f"  {v['name']} ({v['total']} events)")
