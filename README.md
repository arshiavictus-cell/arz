# پیکربندی Nixpacks برای استقرار روی Railway
# نصب وابستگی‌ها، ساخت پروژه و سرو کردن خروجی استاتیک (پوشه dist)

[phases.setup]
nixPkgs = ["nodejs_20"]

[phases.install]
cmds = ["npm ci || npm install"]

[phases.build]
cmds = ["npm run build"]

[start]
cmd = "npx serve -s dist -l $PORT"
