import os
import re

directory = r"c:\Users\Applag\OneDrive - um5.ac.ma\Desktop\portfolio\public\projects\bdanow"

# Regex to match most emojis
emoji_pattern = re.compile(
    "["
    u"\U0001F300-\U0001F64F"
    u"\U0001F680-\U0001F6FF"
    u"\U0001F1E0-\U0001F1FF"
    u"\u2702-\u27B0"
    u"\u24C2-\u24C2"
    u"\U0001F900-\U0001F9FF"
    u"\U0001FA70-\U0001FAFF"
    u"\u2600-\u26FF"
    "]+", flags=re.UNICODE)

for root, dirs, files in os.walk(directory):
    for file in files:
        if file.endswith(('.js', '.html', '.css')) and file != 'code.html':
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
            
            cleaned = emoji_pattern.sub('', content)
            if cleaned != content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(cleaned)
                print(f"Cleaned: {file}")
