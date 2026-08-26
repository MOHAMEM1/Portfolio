lines = open("api/index.py", encoding="utf-8").read().split("\n")
new_lines = []
for line in lines:
    if line.startswith("app.include_router("):
        if 'prefix="' in line:
            new_lines.append(line.replace('prefix="', 'prefix="/api'))
        else:
            new_lines.append(line.replace(')', ', prefix="/api")'))
    else:
        new_lines.append(line)
open("api/index.py", "w", encoding="utf-8").write("\n".join(new_lines))
