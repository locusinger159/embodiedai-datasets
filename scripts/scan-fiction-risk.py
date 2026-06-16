#!/usr/bin/env python3
"""
Superdata RobotAI — AI Hallucination Risk Scanner

Scans all datasets for signs of AI-generated fabrication.
Based on known patterns from FMTC, OCRL, and RoboNat cases.

Usage: python3 scripts/scan-fiction-risk.py
"""

import json
import re
import sys
from collections import Counter

with open('docs/data/datasets.json') as f:
    datasets = json.load(f)

print("=" * 60)
print("🔍 AI Fiction Risk Scanner — analyzing {} datasets".format(len(datasets)))
print("=" * 60)

# Risk factors (each worth 1 point)
RISK_WEIGHTS = {
    'empty_tags': 2,           # No tags — AI can't invent meaningful tags
    'thin_notes': 2,           # Notes < 50 chars — too vague
    'thin_description': 1,     # Description < 200 chars
    'no_official_link': 3,     # No project website
    'no_paper': 2,             # No paper link at all
    'paper_not_arxiv': 1,      # Paper link exists but not arxiv (less verifiable)
    'no_changelog': 1,         # No changelog entries
    'no_github_no_hf': 1,      # No GitHub AND no HuggingFace
    'vague_scale': 1,          # Scale contains vague words like "未知" or "—"
    'suspicious_institution': 2,# Institution matches known fuzzy patterns
    'minimal_citation': 2,     # No bibtex citation
    'no_year': 3,              # No year info (we fixed this but check anyway)
}

# Vague scale patterns
VAGUE_SCALE_PATTERNS = [
    r'^未知', r'^—$', r'^暂无', r'^未公开',
    r'数据集$', r'自然语言', r'交互数据集',
]

# Known-good datasets that passed manual verification (from previous audits)
KNOWN_GOOD = {
    'open-x-embodiment', 'bridgedata-v2', 'rh20t', 'roboSet',
    'libero', 'metaworld', 'rlbench', 'maniskill2', 'calvin',
    'ario', 'rt-1-data', 'robocat-data', 't-diffusion-data',
    'agibot-world-2026', 'robomind', 'damo-solo',
    'fourier-actionnet', 'nvidia-gr1-sim', 'unitree-lafan1',
    'unifolm-wbt', 'digit-dataset', 'tactip-datasets',
    'graspnet-1billion', 'dexnet-2', 'matterport3d',
    'humanoid-everyday', 'dexora', 'realsource',
    '10kh-realomni-open', 'robocoin', 'openlet', 'uniact',
    'galaxea-god', 'oxe-auge', 'droid', 'mimicgen',
    'robocasa', 'arnold', 'robonet', 'ego4d',
    'handal', '3doi', 'hova-500k', 'reasonaff',
    'instructpart', 'scenefun3d', 'robomind-2', 'hoi4d',
    'vitra', 'bc-z', 'aloha', 'internscenes',
    'kairos-homeworld', 'gr00t-n1', 'motionmillions',
    'dexgraspvla', 'graspvla-syngrasp',
}

results = []

for d in datasets:
    name = d.get('name', '?')
    did = d.get('id', '?')
    score = 0
    flags = []

    # 1. Empty tags
    if not d.get('tags') or len(d.get('tags', [])) == 0:
        score += RISK_WEIGHTS['empty_tags']
        flags.append('tags 为空')

    # 2. Thin notes
    notes = d.get('notes', '')
    if len(notes) < 50:
        score += RISK_WEIGHTS['thin_notes']
        flags.append(f'notes 过短 ({len(notes)}字)')

    # 3. Thin description
    desc = d.get('description', '')
    if len(desc) < 200:
        score += RISK_WEIGHTS['thin_description']
        flags.append(f'description 过短 ({len(desc)}字)')

    # 4. No official link
    official = d.get('links', {}).get('official', '')
    if not official:
        score += RISK_WEIGHTS['no_official_link']
        flags.append('无 official 链接')

    # 5. No paper
    paper = d.get('links', {}).get('paper', '')
    if not paper:
        score += RISK_WEIGHTS['no_paper']
        flags.append('无 paper 链接')
    elif 'arxiv' not in paper:
        score += RISK_WEIGHTS['paper_not_arxiv']
        flags.append('paper 非 arxiv (较难验证)')

    # 6. No changelog
    if not d.get('changelog') or len(d.get('changelog', [])) == 0:
        score += RISK_WEIGHTS['no_changelog']
        flags.append('无 changelog')

    # 7. No GitHub and no HuggingFace
    has_gh = bool(d.get('github') or d.get('links', {}).get('github'))
    has_hf = bool(d.get('huggingface') or d.get('links', {}).get('huggingface'))
    if not has_gh and not has_hf:
        score += RISK_WEIGHTS['no_github_no_hf']
        flags.append('无 GitHub 且无 HuggingFace')

    # 8. Vague scale
    scale = d.get('scale', '')
    if any(re.search(p, scale) for p in VAGUE_SCALE_PATTERNS):
        score += RISK_WEIGHTS['vague_scale']
        flags.append(f'scale 模糊: "{scale}"')

    # 9. No citation
    bib = d.get('citation', {}).get('bibtex', '')
    if not bib:
        score += RISK_WEIGHTS['minimal_citation']
        flags.append('无 BibTeX 引用')

    # 10. No year
    if not d.get('year'):
        score += RISK_WEIGHTS['no_year']
        flags.append('缺少年份')

    # Adjust: if this is a known-good dataset, reduce score
    if did in KNOWN_GOOD:
        score = max(0, score - 5)

    results.append({
        'id': did,
        'name': name,
        'score': score,
        'flags': flags,
        'institution': d.get('institution', ''),
        'official': official,
        'paper': paper,
        'tags': d.get('tags', []),
        'notes': notes[:80],
        'year': d.get('year'),
    })

# Sort by risk score
results.sort(key=lambda r: -r['score'])

# --- Report ---

HIGH_RISK = 5
MED_RISK = 3

high = [r for r in results if r['score'] >= HIGH_RISK]
med = [r for r in results if MED_RISK <= r['score'] < HIGH_RISK]
low = [r for r in results if r['score'] < MED_RISK]

print(f"\n📊 Risk Distribution:")
print(f"  🔴 High risk (≥{HIGH_RISK}): {len(high)}")
print(f"  🟡 Medium risk ({MED_RISK}-{HIGH_RISK-1}): {len(med)}")
print(f"  🟢 Low risk (<{MED_RISK}): {len(low)}")

if high:
    print(f"\n{'='*60}")
    print("🔴 HIGH RISK — 强烈建议逐一人工验证")
    print(f"{'='*60}")
    for r in high:
        print(f"\n  [{r['score']}分] {r['name']} ({r['year']})")
        print(f"  机构: {r['institution']}")
        print(f"  Official: {r['official'] or '(无)'}")
        print(f"  Paper: {r['paper'] or '(无)'}")
        print(f"  Tags: {r['tags']}")
        print(f"  Notes: {r['notes']}")
        print(f"  风险因素: {', '.join(r['flags'])}")

if med:
    print(f"\n{'='*60}")
    print("🟡 MEDIUM RISK — 建议抽查")
    print(f"{'='*60}")
    for r in med:
        print(f"  [{r['score']}分] {r['name']} — {', '.join(r['flags'][:3])}")

print(f"\n{'='*60}")
print("✅ 验证方法（针对高风险条目）:")
print("  1. Google 搜索数据集全名 + 机构名")
print("  2. 打开 paper 链接，确认论文主题与数据集一致")
print("  3. 打开 official 链接，确认页面存在且内容匹配")
print("  4. 检查 HuggingFace / GitHub 是否有对应仓库")
print(f"{'='*60}")
