"""
Extract text from PDF papers and chunk for embedding.
Output: fc/papers_text.json — array of {id, paperId, title, dataset, text}
Usage: python3 scripts/extract-papers.py
"""
import fitz, json, os, re, sys

base = 'papers'
chunk_size = 500  # ~chars per chunk
max_chunks = 10   # max chunks per paper

# Build arxiv ID → dataset mapping
with open('docs/data/datasets.json') as f:
    datasets = json.load(f)
arxiv_to_dataset = {}
for d in datasets:
    paper = d.get('links', {}).get('paper', '')
    m = re.search(r'(\d{4}\.\d{4,5})', paper)
    if m:
        arxiv_to_dataset[m.group(0)] = d['name']

all_chunks = []
stats = {'ok': 0, 'empty': 0, 'fail': 0}

for subdir in ['datasets', 'standards', 'tools']:
    target = os.path.join(base, subdir)
    if not os.path.isdir(target):
        continue

    for fname in sorted(os.listdir(target)):
        if not fname.endswith('.pdf'):
            continue

        fpath = os.path.join(target, fname)
        aid = re.match(r'(\d{4}\.\d{4,5})', fname)
        aid = aid.group(1) if aid else fname.replace('.pdf', '')

        try:
            doc = fitz.open(fpath)
            text = ''
            for page in doc:
                text += page.get_text()
            doc.close()

            if len(text) < 200:
                stats['empty'] += 1
                continue

            # Extract title
            lines = text.split('\n')
            title = next((l.strip() for l in lines if l.strip()), fname)[:150]

            # Chunk by paragraphs
            paragraphs = text.split('\n\n')
            current = ''
            chunks = []

            for para in paragraphs:
                if len(current + para) > chunk_size and current:
                    chunks.append(current.strip()[:1000])
                    current = para
                else:
                    current += ('\n\n' if current else '') + para

            if current.strip():
                chunks.append(current.strip()[:1000])

            # Take top N chunks
            for i, chunk in enumerate(chunks[:max_chunks]):
                all_chunks.append({
                    'id': f'{aid}_c{i}',
                    'paperId': aid,
                    'title': title,
                    'dataset': arxiv_to_dataset.get(aid, ''),
                    'text': chunk,
                })

            stats['ok'] += 1
        except Exception as e:
            stats['fail'] += 1
            if stats['fail'] <= 5:
                print(f"  FAIL: {fname} - {e}", file=sys.stderr)

with open('fc/papers_text.json', 'w') as f:
    json.dump(all_chunks, f, ensure_ascii=False)

print(f"Papers: {stats['ok']} OK, {stats['empty']} empty, {stats['fail']} failed")
print(f"Chunks: {len(all_chunks)}")
print(f"Saved: fc/papers_text.json ({os.path.getsize('fc/papers_text.json') / 1024:.0f} KB)")
