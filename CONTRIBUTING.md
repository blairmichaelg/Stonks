# Contributing to Stonks

First off, thank you for considering contributing to Stonks! 🎉

It's people like you that make Stonks such a great tool for the financial technology community. We welcome contributions from everyone, whether you're fixing a typo, reporting a bug, or implementing a new feature.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How Can I Contribute?](#how-can-i-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Features](#suggesting-features)
  - [Code Contributions](#code-contributions)
- [Development Workflow](#development-workflow)
- [Style Guidelines](#style-guidelines)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/Stonks.git
   cd Stonks
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/blairmichaelg/Stonks.git
   ```
4. **Install dependencies**:
   ```bash
   npm install
   ```
5. **Set up your development environment** following the instructions in the [README](README.md)

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the [issue tracker](https://github.com/blairmichaelg/Stonks/issues) to avoid duplicates.

When creating a bug report, please include:

- **Clear and descriptive title**
- **Detailed steps to reproduce** the issue
- **Expected behavior** vs. **actual behavior**
- **Screenshots or error messages** if applicable
- **Environment details** (OS, Node version, browser)
- **Additional context** that might be relevant

Use our [bug report template](.github/ISSUE_TEMPLATE/bug_report.md) when filing issues.

### Suggesting Features

We love feature suggestions! Before creating a feature request:

1. **Check existing issues** to see if it's already been suggested
2. **Consider the scope** - does it fit the project's goals?
3. **Be specific** about the problem you're trying to solve

Use our [feature request template](.github/ISSUE_TEMPLATE/feature_request.md) when suggesting features.

### Code Contributions

We welcome pull requests for:

- Bug fixes
- New features
- Documentation improvements
- Performance optimizations
- Test coverage improvements

## Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bugfix-name
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Test additions or modifications
- `chore/` - Maintenance tasks

### 2. Make Your Changes

- Write clean, readable code
- Follow our [style guidelines](#style-guidelines)
- Add tests for new functionality
- Update documentation as needed
- Ensure all tests pass: `npm run check`

### 3. Commit Your Changes

```bash
git add .
git commit -m "feat: add amazing new feature"
```

Follow our [commit message guidelines](#commit-message-guidelines).

### 4. Keep Your Branch Updated

```bash
git fetch upstream
git rebase upstream/main
```

### 5. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a pull request on GitHub.

## Style Guidelines

### TypeScript/JavaScript

- **Use TypeScript** for all new code
- **Enable strict mode** - don't use `any` unless absolutely necessary
- **Use meaningful variable names** - prefer `userStrategy` over `us`
- **Write self-documenting code** - comments should explain "why", not "what"
- **Keep functions small** - ideally under 50 lines
- **Use functional programming** where appropriate (map, filter, reduce)

### File Naming

- **Components**: PascalCase (e.g., `StrategyBuilder.tsx`)
- **Utilities**: camelCase (e.g., `formatCurrency.ts`)
- **Constants**: SCREAMING_SNAKE_CASE in the file (e.g., `export const MAX_STRATEGIES = 100`)

### Code Style

We use ESLint and Prettier for code formatting. Before committing:

```bash
npm run check
```

**Key conventions:**
- Use **2 spaces** for indentation
- Use **single quotes** for strings (except in JSX where double quotes are used)
- Use **trailing commas** in multi-line objects and arrays
- Use **arrow functions** for callbacks
- Prefer **const** over **let**, avoid **var**
- Use **async/await** over promises when possible

### Component Structure

```tsx
// 1. Imports (external, then internal)
import { useState } from "react";
import { Button } from "@/components/ui/button";

// 2. Types/Interfaces
interface StrategyBuilderProps {
  initialValue?: string;
}

// 3. Component
export function StrategyBuilder({ initialValue }: StrategyBuilderProps) {
  // 4. Hooks
  const [value, setValue] = useState(initialValue ?? "");

  // 5. Event handlers
  const handleSubmit = () => {
    // ...
  };

  // 6. Render
  return (
    <div>
      <Button onClick={handleSubmit}>Submit</Button>
    </div>
  );
}
```

### Documentation

- Add **JSDoc comments** for public functions and complex logic:

```typescript
/**
 * Parses a natural language trading strategy into structured format.
 * 
 * @param prompt - The natural language description of the strategy
 * @returns Parsed strategy object with entry/exit conditions
 * @throws {Error} When API services are unavailable
 * 
 * @example
 * const strategy = await parseStrategy("Buy when RSI < 30");
 */
async function parseStrategy(prompt: string): Promise<ParsedStrategy> {
  // ...
}
```

## Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semicolons, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks, dependency updates

### Examples

```
feat(backtest): add Sharpe ratio calculation

Implements Sharpe ratio metric for strategy performance evaluation.
Uses risk-free rate of 2% as default.

Closes #123
```

```
fix(api): prevent duplicate strategy creation

Added validation to check for existing strategies with the same name
before creating new ones.

Fixes #456
```

## Pull Request Process

1. **Update documentation** if you've changed APIs or added features
2. **Add tests** for new functionality
3. **Ensure all tests pass** locally
4. **Update the README** if necessary
5. **Link related issues** in the PR description
6. **Request review** from maintainers
7. **Address feedback** promptly and professionally

### PR Checklist

Before submitting, ensure:

- [ ] Code follows the style guidelines
- [ ] Self-review of code completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added/updated and passing
- [ ] Dependent changes merged
- [ ] Commit messages follow guidelines

### Review Process

- PRs require at least **one approval** from a maintainer
- **CI checks must pass** before merging
- Maintainers may request changes or ask questions
- Be patient - reviews may take a few days

## Development Tips

### Running Tests

```bash
# Type checking
npm run check

# Run dev server
npm run dev

# Build for production
npm run build
```

### Database Changes

If you modify the database schema:

1. Update `shared/schema.ts`
2. Run `npm run db:push` to apply changes
3. Document the migration in your PR

### Testing AI Features

The app works without API keys by using fallback strategies. For full testing:

1. Get API keys from [Perplexity](https://www.perplexity.ai/) and [Google AI](https://ai.google.dev/)
2. Add them to your `.env` file
3. Test with various natural language inputs

## Questions?

Feel free to:
- Open an issue for questions
- Join discussions on GitHub Discussions
- Reach out to maintainers

Thank you for contributing to Stonks! 🚀📈
