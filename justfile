# 2π Coaching · build & deploy

# default: list recipes
default:
    @just --list

# build the site (content/ + site/ → docs/)
build:
    node build.js

# preview locally at http://localhost:{{port}} (Ctrl-C to stop)
host-local port="8000":
    node build.js
    @echo "→ http://localhost:{{port}}"
    cd docs && python3 -m http.server {{port}} --bind 127.0.0.1

# commit everything and publish to GitHub Pages
# usage: just deploy "my commit message"
deploy msg="update content":
    node build.js
    git add -A
    @-git diff --cached --quiet || git commit -m "{{msg}}"
    git push
    @sleep 2
    @echo "🚀 deploy run:"
    @-gh run list --repo philomont/coaching_practice -L 1

# sanity checks (JS parse, docs present)
check:
    node --check build.js
    node --check site/script.js
    @test -f docs/index.html || node build.js >/dev/null
    @echo "checks OK"

# remove generated output (next build is a clean rebuild)
clean:
    rm -rf docs
