---
name: tdd
description: >
  Write code using Test-Driven Development (TDD): write the failing test first,
  then the minimal code to pass it, then refactor. Use this skill whenever the
  user asks to implement a feature, fix a bug, or write any production code —
  especially when they say "use TDD", "write tests first", "red-green-refactor",
  or "drive this with tests". Also trigger when implementing new functions,
  classes, or modules where behavioral correctness matters. TDD applies to all
  languages: JavaScript/TypeScript (Jest/Vitest), Python (pytest), Go (testing),
  Java/Kotlin (JUnit 5), and others.
---

# Test-Driven Development

Write the test first. Watch it fail. Write the minimum code to pass. Refactor. Repeat — one test at a time.

**The iron law**: no production code without a failing test first. Any code written before a test must be deleted and restarted. No exceptions for "I already know how it works" or "just this once."

## The Red-Green-Refactor Cycle

Each cycle covers exactly **one test**. Not one feature, one test.

### 1. RED — Write a failing test

Write a test that defines the next piece of behavior you need. It must:
- **Fail** when you run it (if it passes immediately, it proves nothing)
- **Fail for the right reason** — read the error message and verify it says what you expect
- **Be minimal** — one behavior, not a scenario that covers five things

Name tests to describe behavior, not implementation:
```javascript
// Good — describes behavior
test("returns empty array when input is empty")
test("throws if user email is missing")

// Bad — describes implementation  
test("calls validateEmail function")
test("sets isValid to true")
```

### 2. GREEN — Write the minimum code to pass

Make the test pass using the **simplest code that could possibly work**. Hard-coding the return value is legitimate — the next test will force generalization. Do not write code the tests don't yet demand (YAGNI).

```python
# First test: add(1, 1) == 2
# Minimum code: return 2   ← valid. Next test forces real logic.
def add(a, b):
    return 2
```

Run all tests. Every test must pass — not just the new one.

### 3. REFACTOR — Clean up before moving on

With all tests green, eliminate duplication, improve names, extract helpers, clarify intent. The tests are your safety net — refactor freely.

**Do not write the next RED test until this code is clean.** Skipping refactor is the most common way TDD accumulates debt.

---

## Test Anatomy

Structure every test as **Arrange → Act → Assert**:

```javascript
test("calculates discounted price for members", () => {
  // Arrange
  const cart = new Cart({ memberDiscount: 0.1 });
  cart.add({ price: 100 });

  // Act
  const total = cart.checkout();

  // Assert
  expect(total).toBe(90);
});
```

**Multiple assertions are fine** if they verify aspects of the same behavior. They're a problem when they test unrelated behaviors — that's two tests disguised as one.

**Test independence**: each test must run in isolation, in any order, without shared state. Use `beforeEach` / `afterEach` to reset state.

---

## What to Test vs. What to Skip

**Test:**
- Business logic and domain rules
- Edge cases and error paths (nulls, empty inputs, boundaries)
- Behavior observable from the public interface

**Skip:**
- Trivial getters/setters with no logic
- Third-party library internals
- Implementation details (private methods, internal state)
- Generated code and configuration files
- Throwaway prototypes/spikes

Test **coverage is not the goal** — behavioral correctness is. 70% coverage of real behavior beats 100% coverage of getters.

---

## Test Doubles: The Full Taxonomy

"Mock" is often used as a catch-all, but there are five distinct types with different purposes. Using the wrong one leads to brittle tests.

| Type | What it does | Verification | When to use |
|---|---|---|---|
| **Dummy** | Placeholder that's never called | None | Filling required params that don't matter for this test |
| **Stub** | Returns canned data | State (you assert after) | Controlling what a dependency returns |
| **Spy** | Stub that records calls | State + call records | When you need both controlled data AND to verify calls happened |
| **Mock** | Pre-programmed expectations | Behavior (mock verifies itself) | When the call itself is what you're testing |
| **Fake** | Real working implementation, production shortcuts | State | Best default — most resilient to refactoring |

```python
# Fake — real logic, no persistence (most resilient)
class InMemoryUserRepo:
    def __init__(self): self._users = {}
    def save(self, user): self._users[user.email] = user
    def find(self, email): return self._users.get(email)

# Stub — returns canned data, don't care how many times called
stub_repo = Mock()
stub_repo.find.return_value = User(email="john@example.com")

# Mock — verifies the call happened (behavior verification)
mock_email = Mock()
service.register("john@example.com")
mock_email.send_confirmation.assert_called_once_with("john@example.com")
```

**The rule:** Fakes over mocks when possible. Mocks over stubs when you need to verify interaction. If mock setup exceeds ~10 lines, the design is too coupled — redesign, don't add more mocks.

---

## Async Testing

Async tests fail silently when you forget to await — the test exits before assertions run, giving a false green.

```javascript
// WRONG — test passes even if fetchUser throws or returns wrong data
test("bad", () => {
  fetchUser(1).then(u => expect(u.name).toBe("John"));
});

// RIGHT — three safe patterns
test("async/await", async () => {
  const u = await fetchUser(1);
  expect(u.name).toBe("John");
});

test("return promise", () => {
  return fetchUser(1).then(u => expect(u.name).toBe("John"));
});

test("safeguard with hasAssertions", () => {
  expect.hasAssertions(); // fails if no assertion ever runs
  fetchUser(1).then(u => expect(u.name).toBe("John"));
});
```

**Fake timers** — for testing timeouts, retries, debounce, intervals without waiting real time:

```javascript
jest.useFakeTimers();

test("retries after delay", async () => {
  const spy = jest.fn().mockRejectedValueOnce(new Error()).mockResolvedValue("ok");
  const promise = retryWithDelay(spy, 1000);
  await jest.advanceTimersByTimeAsync(1000); // use Async variant to flush microtasks
  await expect(promise).resolves.toBe("ok");
  jest.useRealTimers();
});
```

```python
# pytest-asyncio for Python async tests
import pytest

@pytest.mark.asyncio
async def test_fetch_user():
    user = await fetch_user(1)
    assert user.name == "John"
```

---

## Test Strategy: Pyramid, Trophy, or Honeycomb

Pick the ratio that matches your codebase type:

| Model | Unit | Integration | E2E | Best for |
|---|---|---|---|---|
| **Pyramid** | 70% | 20% | 10% | Traditional monoliths, complex domain logic |
| **Trophy** | 10% | 50% | 40% | Frontend apps (React, Vue) — tests behavior, not implementation |
| **Honeycomb** | 5% | 85% | 10% | Microservices — complexity lives at service boundaries |

**Default starting point:** Trophy. Most apps benefit from heavy integration tests (real DB, real HTTP, real component trees) over heavily mocked unit tests. Unit tests for complex pure logic, integration tests for wiring, a handful of E2E tests for critical flows.

---

## Language Idioms

### JavaScript / TypeScript — Jest or Vitest
```typescript
describe("UserService", () => {
  beforeEach(() => jest.clearAllMocks());

  it("throws when email is missing", async () => {
    await expect(service.register({ name: "John" }))
      .rejects.toThrow("Email is required");
  });
});
```
- Prefer `async/await` for async tests — omitting `await` gives false passes
- Use `screen.getByRole()` / `getByLabelText()` for UI, not `getByTestId`
- Vitest is faster for Vite projects; API is nearly identical to Jest

### Python — pytest
```python
@pytest.fixture
def user_repo():
    return InMemoryUserRepo()

def test_register_creates_user(user_repo):
    service = UserService(repo=user_repo)
    service.register("john@example.com")
    assert user_repo.find_by_email("john@example.com") is not None

@pytest.mark.parametrize("email", ["", None, "not-an-email"])
def test_register_rejects_invalid_email(email, user_repo):
    with pytest.raises(ValueError):
        UserService(repo=user_repo).register(email)
```

### Go — `testing` package
```go
// Table-driven tests are idiomatic Go
func TestAdd(t *testing.T) {
    tests := []struct {
        name string
        a, b int
        want int
    }{
        {"positive numbers", 2, 3, 5},
        {"with zero", 0, 5, 5},
        {"negatives", -1, -2, -3},
    }
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            if got := Add(tt.a, tt.b); got != tt.want {
                t.Errorf("Add(%d, %d) = %d, want %d", tt.a, tt.b, got, tt.want)
            }
        })
    }
}
```

### Kotlin — JUnit 5
```kotlin
@Test
fun `should throw when email is missing`() {
    assertThrows<IllegalArgumentException> {
        UserService().register(name = "John", email = "")
    }
}
```

---

## Design Feedback: Listening to Tests

Pain writing tests reveals real design problems:

| Pain | Design signal |
|---|---|
| Constructor needs 8+ parameters | Class has too many responsibilities |
| 50+ lines of setup to test one thing | Component is too tightly coupled |
| Can't test X without also running Y | Missing abstraction or dependency injection |
| Constructor calls external services | Side effects don't belong in constructors |
| Refactoring breaks many tests | Tests are testing implementation, not behavior |

When tests hurt, don't reach for more mocks — redesign the component.

---

## London vs. Chicago (When Each Applies)

**Chicago / Detroit (inside-out):** Start at domain logic, work outward. Prefer real objects over mocks. State-based assertions. Good when domain logic is the hard part.

**London (outside-in):** Start at the system boundary (API endpoint, UI action), mock dependencies, work inward. Good when integrating many components or building from a clear acceptance test.

Either approach works. Pick one and be consistent per feature. Don't mix strategies within a single test suite without reason.

---

## Property-Based Testing

Instead of hand-crafting examples, define invariants that must hold for all inputs and let the framework generate hundreds of random cases. Finds edge cases you'd never think to write.

```python
# Hypothesis (Python) — test that sorting is idempotent and preserves length
from hypothesis import given, strategies as st

@given(st.lists(st.integers()))
def test_sort_invariants(lst):
    result = sorted(lst)
    assert len(result) == len(lst)          # no elements lost
    assert sorted(result) == result          # idempotent
    assert all(result[i] <= result[i+1]      # actually sorted
               for i in range(len(result)-1))
```

```typescript
// fast-check (JS/TS) — test that add is commutative
import * as fc from "fast-check";

test("add is commutative", () => {
  fc.assert(fc.property(
    fc.integer(), fc.integer(),
    (a, b) => add(a, b) === add(b, a)
  ));
});
```

Good properties to look for: **idempotence** (f(f(x)) = f(x)), **roundtrip** (decode(encode(x)) = x), **invariants** (sort preserves length), **commutativity** (a+b = b+a). Avoid trivial properties that any implementation would satisfy.

Use property-based tests alongside example-based tests — they complement, not replace each other.

## Mutation Testing: Verifying Your Tests Are Useful

Code coverage tells you what lines ran. Mutation testing tells you whether your tests would actually catch bugs.

A mutation tool modifies your code (flips `>` to `>=`, returns `false` instead of `true`, etc.) and checks if your tests fail. If tests still pass — the mutant "survived" — you have a gap.

```javascript
// Coverage: 100% (line executed). Mutation test: fails.
function isAdult(age) { return age >= 18; }
test("adult check", () => expect(isAdult(20)).toBe(true));
// Mutant: age > 18 — test still passes! Missing boundary case.

// Fix — add the edge case:
test("boundary", () => {
  expect(isAdult(18)).toBe(true);   // kills the > mutant
  expect(isAdult(17)).toBe(false);
});
```

**Tools:** Stryker (JS/TS), mutmut (Python), go-mutesting (Go). Run on CI for critical modules; use incremental mode to avoid slow full runs.

---

## Common Failure Modes

- **Writing multiple tests before implementing** — the cycle is per-test, not per-feature
- **Test passes immediately** — you haven't written enough code to fail it; rethink the test
- **Skipping refactor** — this is where TDD debt accumulates fastest
- **Testing what you wrote, not what was needed** — read the test as a spec: does it describe the right behavior?
- **Rationalizing "just this once"** — delete the code written before the test and restart

---

## References (official docs)

Always confirm against the docs for the version installed in the project — APIs and defaults shift between majors. Versions below are accurate as of May 2026; treat them as "current at time of writing," not pinned requirements.

### Test runners / frameworks
- **Jest** (JavaScript/TypeScript) — https://jestjs.io/docs/getting-started — current major: **Jest 30** (released June 2025; 30.x is the active line). Migration notes: https://jestjs.io/docs/upgrading-to-jest30
- **Vitest** (Vite-native JS/TS) — https://vitest.dev/guide/ — current line: **Vitest 4.x** (4.1 shipped March 2026; v5 in beta). API is largely Jest-compatible. Mock/fake-timer reference: https://vitest.dev/api/vi
- **pytest** (Python) — https://docs.pytest.org/en/stable/ — current major: **pytest 9.x** (9.0 released Nov 2025; 8.x still widely used). Fixtures: https://docs.pytest.org/en/stable/how-to/fixtures.html · Parametrize: https://docs.pytest.org/en/stable/how-to/parametrize.html
  - **pytest-asyncio** (async tests): https://pytest-asyncio.readthedocs.io/en/latest/
- **Go `testing`** (standard library) — https://pkg.go.dev/testing — table-driven tests and subtests via `t.Run` are idiomatic; built-in fuzzing (`testing.F`): https://go.dev/doc/security/fuzz/
- **JUnit 5 (Jupiter)** (Java/Kotlin) — https://junit.org/junit5/docs/current/user-guide/ — note: **JUnit 6** is now GA (6.x, 2026) and is the forward path; JUnit 5 remains stable and very widely deployed. Check which the project targets.

### Mutation testing
- **Stryker / StrykerJS** (JS/TS, also .NET and Scala variants) — https://stryker-mutator.io/docs/ — StrykerJS current major: **9.x** (2026). Incremental mode docs: https://stryker-mutator.io/docs/stryker-js/incremental/
- **mutmut** (Python) — https://mutmut.readthedocs.io/
- **go-mutesting** (Go) — https://github.com/avito-tech/go-mutesting

### Property-based testing
- **fast-check** (JS/TS) — https://github.com/dubzzz/fast-check · docs: https://fast-check.dev/
- **Hypothesis** (Python) — https://hypothesis.readthedocs.io/en/latest/
- **rapid** (Go, modern, recommended over stdlib `testing/quick`) — https://github.com/flyingmutant/rapid · stdlib option `testing/quick`: https://pkg.go.dev/testing/quick

### Testing assertion/matcher helpers (commonly paired)
- **Testing Library** (DOM/React/Vue — drives the Trophy strategy) — https://testing-library.com/docs/ — prefer role/label queries over `getByTestId`.

> Note: deep links above point at stable/current doc paths. If a versioned path 404s after a major release, fall back to the docs root (the domain) listed for that tool and navigate to the matching version.
