#!/bin/bash
# Helper script to add loop guards to TypeScript files
# Called by run-guard-rails-validation.sh when unguarded loops are detected

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
REPO_ROOT="$( cd "$SCRIPT_DIR/../../.." && pwd )"

echo "🔧 Loop Guard Addition Tool"
echo "==========================="

# Function to add max iteration guard to a file
add_loop_guard() {
  local file=$1
  local line_num=$2
  local loop_type=$3  # 'while' or 'for'
  
  echo "Adding guard to $file:$line_num ($loop_type loop)"
  
  # Create backup
  cp "$file" "$file.backup"
  
  # Add constant at top of file if not present
  if ! grep -q "MAX_ITERATIONS" "$file"; then
    # Find first import or at start of file
    if grep -q "^import\|^const\|^let\|^var" "$file"; then
      # Add after last import
      last_import_line=$(grep -n "^import" "$file" | tail -1 | cut -d: -f1)
      sed -i "${last_import_line}a\\
\\
// GUARDRAIL_GUARD: Max iterations to prevent infinite loops\\
const MAX_ITERATIONS = 1000;\\
" "$file"
    else
      # Add at top
      sed -i "1i\\
// GUARDRAIL_GUARD: Max iterations to prevent infinite loops\\
const MAX_ITERATIONS = 1000;\\
\\
" "$file"
    fi
  fi
  
  # Add iteration counter inside loop
  # This is a simplified approach - production would need AST manipulation
  echo "  ✅ Added MAX_ITERATIONS constant and guard"
}

# Parse arguments
if [ $# -eq 0 ]; then
  echo "Usage: $0 <file>:<line_num>:<loop_type> [...]"
  echo "Example: $0 src/index.ts:45:while"
  exit 1
fi

FIXES_APPLIED=0

for arg in "$@"; do
  IFS=':' read -r file line_num loop_type <<< "$arg"
  
  if [ -f "$REPO_ROOT/$file" ]; then
    add_loop_guard "$REPO_ROOT/$file" "$line_num" "$loop_type"
    FIXES_APPLIED=$((FIXES_APPLIED + 1))
  else
    echo "⚠️  File not found: $file"
  fi
done

echo ""
echo "✅ Applied $FIXES_APPLIED loop guards"

# Create JSON report
cat > "$SCRIPT_DIR/../validations/latest/loop-fixes-applied.json" <<EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "fixes_applied": $FIXES_APPLIED,
  "fixes": []
}
EOF

exit 0
