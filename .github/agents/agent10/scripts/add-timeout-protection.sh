#!/bin/bash
# Helper script to add timeout protection to HTTP calls
# Called by run-guard-rails-validation.sh when missing timeouts are detected

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
REPO_ROOT="$( cd "$SCRIPT_DIR/../../.." && pwd )"

echo "🔧 Timeout Protection Addition Tool"
echo "==================================="

# Function to add timeout to HTTP calls
add_timeout_protection() {
  local file=$1
  
  echo "Adding timeout protection to $file"
  
  # Create backup
  cp "$file" "$file.backup"
  
  # Add timeout constant at top if not present
  if ! grep -q "REQUEST_TIMEOUT" "$file"; then
    if grep -q "^import\|^const\|^let\|^var" "$file"; then
      last_import_line=$(grep -n "^import" "$file" | tail -1 | cut -d: -f1)
      sed -i "${last_import_line}a\\
\\
// AGENT10_GUARD: Timeout for external HTTP requests (30 seconds)\\
const REQUEST_TIMEOUT = 30000;\\
" "$file"
    else
      sed -i "1i\\
// AGENT10_GUARD: Timeout for external HTTP requests (30 seconds)\\
const REQUEST_TIMEOUT = 30000;\\
\\
" "$file"
    fi
  fi
  
  echo "  ✅ Added REQUEST_TIMEOUT constant"
  echo "  ℹ️  Manual review needed to apply timeout to specific calls"
}

# Parse arguments
if [ $# -eq 0 ]; then
  echo "Usage: $0 <file1> [file2] [...]"
  exit 1
fi

FIXES_APPLIED=0

for file in "$@"; do
  if [ -f "$REPO_ROOT/$file" ]; then
    add_timeout_protection "$REPO_ROOT/$file"
    FIXES_APPLIED=$((FIXES_APPLIED + 1))
  else
    echo "⚠️  File not found: $file"
  fi
done

echo ""
echo "✅ Added timeout constants to $FIXES_APPLIED files"
echo "⚠️  Manual review required to apply timeouts to specific HTTP calls"

# Create JSON report
mkdir -p "$SCRIPT_DIR/../validations/latest"
cat > "$SCRIPT_DIR/../validations/latest/timeout-fixes-applied.json" <<EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "fixes_applied": $FIXES_APPLIED,
  "manual_review_required": true,
  "note": "REQUEST_TIMEOUT constants added; apply to specific HTTP calls"
}
EOF

exit 0
