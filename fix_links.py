import os
import re

directory = r"C:\Users\Applag\OneDrive - um5.ac.ma\Desktop\portfolio\public\projects\indh\site_live"
prefix = "/projects/indh/site_live/"

def fix_links():
    # Regex to match href="/..."
    pattern_href1 = re.compile(r'href="/([^"\'<>]*)"')
    pattern_href2 = re.compile(r"href='/([^\"'<>]*)'")
    
    count = 0
    
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(('.html', '.js')):
                filepath = os.path.join(root, file)
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        content = f.read()
                        
                    def repl_href(match):
                        path = match.group(1)
                        if path.startswith('projects/') or path.startswith('_next/') or path.startswith('http'):
                            return match.group(0) # unchanged
                        
                        return 'href="' + prefix + path + '"'
                        
                    def repl_href2(match):
                        path = match.group(1)
                        if path.startswith('projects/') or path.startswith('_next/') or path.startswith('http'):
                            return match.group(0) # unchanged
                        
                        return "href='" + prefix + path + "'"

                    new_content = pattern_href1.sub(repl_href, content)
                    new_content = pattern_href2.sub(repl_href2, new_content)
                    
                    if new_content != content:
                        with open(filepath, 'w', encoding='utf-8') as f:
                            f.write(new_content)
                        count += 1
                        print(f"Fixed links in {file}")
                except Exception as e:
                    pass
    print(f"Total files with fixed links: {count}")

fix_links()
