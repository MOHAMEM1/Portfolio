import os
import shutil

source_dir = r"C:\Users\Applag\OneDrive - um5.ac.ma\Desktop\PROJET STAGE\xaalisi-monorepo"
target_dir = r"C:\Users\Applag\OneDrive - um5.ac.ma\Desktop\portfolio\public\projects\xaalisi\code"

ignore_dirs = {
    "node_modules", "venv", ".git", ".github", "__pycache__", ".next", "dist", "build", ".expo", ".vscode"
}

ignore_files = {
    "package-lock.json", "yarn.lock", "deploy.zip", "temp.js"
}

def copy_tree(src, dst):
    if not os.path.exists(dst):
        os.makedirs(dst)
    
    for item in os.listdir(src):
        if item in ignore_dirs or item in ignore_files:
            continue
            
        s = os.path.join(src, item)
        d = os.path.join(dst, item)
        
        if os.path.isdir(s):
            copy_tree(s, d)
        else:
            try:
                shutil.copy2(s, d)
            except Exception as e:
                print(f"Error copying {s}: {e}")

if __name__ == "__main__":
    print(f"Copying files from {source_dir} to {target_dir}...")
    copy_tree(source_dir, target_dir)
    print("Done copying!")
