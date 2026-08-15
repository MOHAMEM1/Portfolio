import os
import re

directory = r"C:\Users\Applag\OneDrive - um5.ac.ma\Desktop\portfolio\public\projects\indh\site_live"
prefix = "/projects/indh/site_live/"

def fix_paths():
    # Regex to match "/some_image.jpg" or '/some_image.jpg'
    # We want to avoid replacing paths that already have the prefix or are external URLs.
    # Pattern looks for quotes, a forward slash, then characters that don't include quotes or slashes, ending in an image extension.
    # We'll just replace "/(filename.ext)" with prefix + filename.ext if it doesn't already have prefix.
    # Wait, the images might be in a subfolder like "/images/file.png". So we can match "/([^"']*\.(?:png|jpe?g|svg|gif|webp))"
    
    pattern1 = re.compile(r'"/([^"\'<>]*\.(?:png|jpe?g|svg|gif|webp))"')
    pattern2 = re.compile(r"'/([^\"'<>]*\.(?:png|jpe?g|svg|gif|webp))'")
    
    count = 0
    
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(('.html', '.js', '.css', '.json')):
                filepath = os.path.join(root, file)
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        content = f.read()
                        
                    # Replacement function to skip if it's already prefixed or _next/
                    def repl(match):
                        path = match.group(1)
                        if path.startswith('_next/') or path.startswith('projects/'):
                            return match.group(0) # unchanged
                        
                        return '"' + prefix + path + '"'
                        
                    def repl2(match):
                        path = match.group(1)
                        if path.startswith('_next/') or path.startswith('projects/'):
                            return match.group(0) # unchanged
                        
                        return "'" + prefix + path + "'"

                    new_content = pattern1.sub(repl, content)
                    new_content = pattern2.sub(repl2, new_content)
                    
                    if new_content != content:
                        with open(filepath, 'w', encoding='utf-8') as f:
                            f.write(new_content)
                        count += 1
                        print(f"Fixed {file}")
                except Exception as e:
                    pass
    print(f"Total files fixed: {count}")

fix_paths()
