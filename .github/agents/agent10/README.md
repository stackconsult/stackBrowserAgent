# Agent 10: Guard Rails & Error Prevention Specialist

## Overview

Agent 10 is an autonomous validation agent that ensures the stackBrowserAgent codebase never fails silently and always recovers gracefully. It detects and prevents infinite loops, race conditions, and edge cases while validating error handling across the entire codebase.

## Directory Structure

```
.github/agents/agent10/
├── README.md                          # This file
├── scripts/
│   ├── run-guard-rails-validation.sh  # Main validation script
│   ├── add-loop-guards.sh            # Auto-fix for infinite loops
│   └── add-timeout-protection.sh     # Auto-fix for missing timeouts
├── memory/
│   └── guard-rails-history.json      # Historical validation data (MCP memory)
└── validations/
    ├── latest -> YYYYMMDD_HHMMSS/    # Symlink to latest validation
    └── YYYYMMDD_HHMMSS/              # Timestamped validation results
        ├── GUARD_RAILS_REPORT.md     # Human-readable report
        ├── memory-entry.json         # Entry for MCP memory
        ├── test-results.log          # Test execution logs
        └── *.json                    # Various validation artifacts
```

## Validations Performed

### 1. Infinite Loop Protection
- Scans all TypeScript files for `while` and `for` loops
- Detects loops without max iteration guards
- Validates that recursive functions have depth limits
- Auto-adds `MAX_ITERATIONS` constants where needed

### 2. Timeout Protection
- Checks all HTTP requests for explicit timeouts
- Validates database query timeouts
- Ensures no operations can hang indefinitely
- Adds `REQUEST_TIMEOUT` constants for external calls

### 3. Null/Undefined Safety
- Detects potential null reference errors
- Validates use of optional chaining (`?.`)
- Checks for proper null guards before property access

### 4. Error Handling Coverage
- Ensures async functions have try-catch blocks
- Validates error messages don't leak sensitive data
- Checks for proper error logging with context

### 5. Test Suite Validation
- Runs existing test suite
- Validates 94%+ code coverage maintained
- Ensures no regressions introduced

## Usage

### Manual Execution

```bash
# From repository root
.github/agents/agent10/scripts/run-guard-rails-validation.sh

# View latest report
cat .github/agents/agent10/validations/latest/GUARD_RAILS_REPORT.md

# Check MCP memory
cat .github/agents/agent10/memory/guard-rails-history.json
```

### Automated Execution

Agent 10 is designed to run weekly via GitHub Actions on Saturday at 4:00 AM MST.

To set up automated execution:

1. Create GitHub Actions workflow file:

```yaml
# .github/workflows/agent10-guard-rails.yml
name: Agent 10 - Guard Rails Validation

on:
  schedule:
    - cron: '0 11 * * 6'  # Saturday 4:00 AM MST (11:00 UTC)
  workflow_dispatch:

jobs:
  validate-guard-rails:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Run Guard Rails Validation
        run: .github/agents/agent10/scripts/run-guard-rails-validation.sh
      
      - name: Upload Validation Report
        uses: actions/upload-artifact@v3
        with:
          name: guard-rails-report
          path: .github/agents/agent10/validations/latest/
```

2. The workflow will:
   - Run all validations
   - Generate a report
   - Update MCP memory
   - Create handoff artifact for Agent 11

## Integration with Other Agents

### Input from Agent 9 (Optimization)
Agent 10 expects a handoff file `.agent9-to-agent10.json` containing:
- Total optimizations made
- Error handling changes
- Files modified
- Test results

### Output to Agent 11 (Data Analytics)
Agent 10 creates `.agent10-to-agent11.json` containing:
- Validation results
- Performance metrics
- Issues found and fixed
- Weekly comparison data

### Escalation to Agent 7 (Security)
If security issues are detected, Agent 10 creates `.agent10-to-agent7-urgent.json`.

## Guard Rails Currently in Place

The stackBrowserAgent project already has several guard rails:

1. **Rate Limiting**
   - General endpoints: 100 requests/15 minutes
   - Auth endpoints: 10 requests/15 minutes

2. **JWT Token Expiration**
   - Default: 24 hours (configurable)
   - Prevents indefinite token validity

3. **Input Validation**
   - Joi schemas for request validation
   - Type checking via TypeScript

4. **Global Error Handling**
   - Express error middleware
   - Consistent error response format

5. **TypeScript Strict Mode**
   - Compile-time type safety
   - Prevents many runtime errors

## Validation Report Example

Each validation generates a markdown report like this:

```markdown
# Guard Rails Validation Report
**Agent 10: Guard Rails & Error Prevention Specialist**
**Date:** 2025-11-15

## Summary
| Check | Status | Issues Found |
|-------|--------|--------------|
| Infinite Loop Protection | ✅ PASS | 0 |
| Timeout Protection | ✅ PASS | 0 |
| Null Safety | ✅ PASS | 0 |
| Error Handling | ✅ PASS | 0 |
| Test Suite | ✅ PASS | - |

## Recommendations
1. Continue monitoring for new patterns
2. Consider adding circuit breaker pattern
3. Implement request correlation IDs

...
```

## MCP Memory Structure

Agent 10 maintains historical memory in JSON format:

```json
[
  {
    "timestamp": "2025-11-15T16:00:00Z",
    "week": 46,
    "year": 2025,
    "validations": {
      "loop_protection": {
        "issues_found": 0,
        "status": "pass"
      },
      "timeout_protection": {
        "issues_found": 0,
        "status": "pass"
      }
    },
    "guard_rails_validated": [
      "Rate limiting",
      "JWT expiration",
      "Input validation"
    ],
    "performance_impact": {
      "overhead_ms": 15,
      "acceptable": true
    }
  }
]
```

The memory keeps the last 52 weeks (1 year) of validation history.

## Performance Impact

Agent 10 validations have minimal performance impact:

- **Validation Time:** ~30-60 seconds for full scan
- **Runtime Overhead:** < 15ms per request (from guard rails)
- **Disk Space:** ~10MB per year of validation history

## Troubleshooting

### Validation Script Fails
```bash
# Check script permissions
ls -la .github/agents/agent10/scripts/

# Make scripts executable
chmod +x .github/agents/agent10/scripts/*.sh

# Run with verbose output
bash -x .github/agents/agent10/scripts/run-guard-rails-validation.sh
```

### Tests Fail During Validation
```bash
# Run tests manually to diagnose
npm test

# Check test output
cat .github/agents/agent10/validations/latest/test-results.log
```

### Handoff Files Missing
Agent 10 can run without handoff files from Agent 9. It will create a baseline validation.

## Contributing

When adding new validations to Agent 10:

1. Add validation logic to `run-guard-rails-validation.sh`
2. Update the report template to include new checks
3. Add corresponding entries to MCP memory structure
4. Update this README with new validation details
5. Test thoroughly before committing

## Documentation Annotations

When Agent 10 adds guard rails, it uses this annotation format:

```typescript
// AGENT10_GUARD: {protection_type} - {reason}
```

Examples:
```typescript
// AGENT10_GUARD: Max iterations prevents infinite loop on malformed workflow
const MAX_ITERATIONS = 1000;

// AGENT10_GUARD: Timeout prevents hung connections to external API
const REQUEST_TIMEOUT = 30000;

// AGENT10_GUARD: Null check prevents runtime crash on missing config
if (!config) {
  throw new Error('Configuration required');
}
```

## Future Enhancements

Potential improvements for Agent 10:

- [ ] Circuit breaker pattern implementation
- [ ] Request correlation ID tracking
- [ ] Distributed tracing integration
- [ ] Advanced AST-based code analysis
- [ ] Automated performance regression detection
- [ ] Integration with external monitoring tools
- [ ] Machine learning for anomaly detection

## Support

For issues or questions about Agent 10:

1. Check existing validation reports
2. Review MCP memory for patterns
3. Open an issue with the `agent10` label
4. Include validation report in issue description

## License

Agent 10 is part of the stackBrowserAgent project and follows the same ISC license.
