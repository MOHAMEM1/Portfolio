import os

# Base directory for the INDH site
base_dir = r"c:\Users\Applag\OneDrive - um5.ac.ma\Desktop\portfolio\public\projects\indh\site"
output_file = r"c:\Users\Applag\OneDrive - um5.ac.ma\Desktop\portfolio\public\projects\indh\code.html"

# Extensions to include
allowed_exts = ('.ts', '.tsx', '.js', '.jsx', '.css', '.html', '.json', '.mjs', '.yaml')

file_tree = []

def get_icon_class(filename):
    if filename.endswith(('.ts', '.tsx')): return 'ts'
    if filename.endswith(('.js', '.jsx', '.mjs')): return 'js'
    if filename.endswith('.css'): return 'css'
    if filename.endswith('.html'): return 'html'
    if filename.endswith(('.json', '.yaml')): return 'json'
    return 'default'

def scan_dir(dir_path, rel_path=""):
    items = []
    try:
        entries = sorted(os.listdir(dir_path))
    except Exception:
        return items
    
    for entry in entries:
        full_path = os.path.join(dir_path, entry)
        if os.path.isdir(full_path):
            if entry in ('.git', 'node_modules', '.next', 'public'):
                continue
            children = scan_dir(full_path, os.path.join(rel_path, entry))
            if children:
                items.append({'type': 'folder', 'name': entry, 'children': children})
        else:
            if entry.endswith(allowed_exts):
                try:
                    with open(full_path, 'r', encoding='utf-8', errors='ignore') as f:
                        lines = len(f.readlines())
                except:
                    lines = 0
                items.append({
                    'type': 'file', 
                    'name': entry, 
                    'path': os.path.join(rel_path, entry).replace('\\', '/'),
                    'lines': lines,
                    'icon': get_icon_class(entry)
                })
    return items

tree = scan_dir(base_dir)

# HTML Template
html_top = """<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>INDH - Source Code Viewer</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; background: #0f172a; color: #f8fafc; min-height: 100vh; overflow: hidden; }
    .top-bar { position: sticky; top: 0; z-index: 100; background: rgba(15, 23, 42, 0.95); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(255,255,255,0.1); padding: 15px 30px; display: flex; align-items: center; justify-content: space-between; }
    .top-bar h1 { font-size: 1.2rem; font-weight: 700; background: linear-gradient(135deg, #3b82f6, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .top-bar .back-btn { padding: 8px 18px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #f8fafc; cursor: pointer; text-decoration: none; transition: all 0.2s; font-size: 0.85rem;}
    .top-bar .back-btn:hover { background: rgba(255,255,255,0.1); }
    .layout { display: flex; height: calc(100vh - 60px); }
    .sidebar { width: 280px; min-width: 280px; background: #1e293b; border-right: 1px solid rgba(255,255,255,0.1); overflow-y: auto; padding: 15px 0; }
    .sidebar-title { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 2px; color: #64748b; padding: 10px 20px 8px; font-weight: 600; }
    .file-item { padding: 8px 20px 8px 30px; cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 0.85rem; color: #cbd5e1; transition: all 0.15s; border-left: 3px solid transparent; }
    .file-item:hover { background: rgba(255,255,255,0.05); color: #f8fafc; }
    .file-item.active { background: rgba(59, 130, 246, 0.1); color: #3b82f6; border-left-color: #3b82f6; }
    .file-icon { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
    .file-icon.html { background: #e44d26; }
    .file-icon.js { background: #f7df1e; }
    .file-icon.ts { background: #3178c6; }
    .file-icon.css { background: #3b82f6; }
    .file-icon.json { background: #8bc34a; }
    .file-icon.default { background: #94a3b8; }
    .file-meta { margin-left: auto; font-size: 0.65rem; color: #64748b; }
    .folder-label { padding: 12px 20px 6px 20px; font-size: 0.75rem; color: #94a3b8; font-weight: 600; display: flex; align-items: center; gap: 8px; }
    .code-area { flex: 1; overflow: auto; background: #0d1117; }
    .code-header { position: sticky; top: 0; z-index: 10; background: rgba(13, 17, 23, 0.95); backdrop-filter: blur(8px); padding: 12px 20px; border-bottom: 1px solid rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: space-between; }
    .code-header .filename { font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; color: #e2e8f0; }
    pre { margin: 0; padding: 0; }
    code.hljs { font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; line-height: 1.6; padding: 20px; background: transparent !important; }
    .welcome-screen { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #475569; gap: 15px; }
  </style>
</head>
<body>
  <div class="top-bar">
    <a href="/" class="back-btn">← Portfolio</a>
    <h1>INDH — Source Code</h1>
  </div>
  <div class="layout">
    <div class="sidebar">
      <div class="sidebar-title">Explorateur (Next.js)</div>
"""

html_bottom = """
    </div>
    <div class="code-area">
      <div class="welcome-screen" id="welcome">
        <p>Sélectionnez un fichier pour voir le code source</p>
      </div>
      <div id="code-view" style="display:none;">
        <div class="code-header">
          <span class="filename" id="current-file"></span>
        </div>
        <pre><code id="code-content"></code></pre>
      </div>
    </div>
  </div>

  <script>
    const basePath = '/projects/indh/site/';
    
    document.querySelectorAll('.file-item').forEach(item => {
      item.addEventListener('click', async () => {
        document.querySelectorAll('.file-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');

        const file = item.dataset.path;
        let lang = 'javascript';
        if(file.endsWith('.ts') || file.endsWith('.tsx')) lang = 'typescript';
        else if(file.endsWith('.css')) lang = 'css';
        else if(file.endsWith('.json')) lang = 'json';
        else if(file.endsWith('.html')) lang = 'html';

        document.getElementById('welcome').style.display = 'none';
        document.getElementById('code-view').style.display = 'block';
        document.getElementById('current-file').textContent = file;
        document.getElementById('code-content').textContent = 'Loading...';

        try {
          const res = await fetch(basePath + file);
          const text = await res.text();
          
          const codeEl = document.getElementById('code-content');
          codeEl.textContent = text;
          codeEl.className = `language-${lang}`;
          delete codeEl.dataset.highlighted;
          hljs.highlightElement(codeEl);
        } catch (err) {
          document.getElementById('code-content').textContent = 'Erreur: ' + err.message;
        }
      });
    });
  </script>
</body>
</html>
"""

def build_html_tree(nodes, depth=0):
    html = ""
    for node in nodes:
        if node['type'] == 'folder':
            html += f'      <div class="folder-label" style="padding-left: {20 + depth*10}px">📁 {node["name"]}</div>\n'
            html += build_html_tree(node['children'], depth + 1)
        else:
            padding = 30 + depth*10
            html += f'      <div class="file-item" data-path="{node["path"]}" style="padding-left: {padding}px">\n'
            html += f'        <span class="file-icon {node["icon"]}"></span> {node["name"]}\n'
            html += f'        <span class="file-meta">{node["lines"]} L</span>\n'
            html += f'      </div>\n'
    return html

with open(output_file, 'w', encoding='utf-8') as f:
    f.write(html_top)
    f.write(build_html_tree(tree))
    f.write(html_bottom)

print("Generated code.html for INDH!")
