# Bloom - OOP Final Project

**Team Members:** Lauren Lewis, Ashley Velasquez

---
### Tech Stack

|Tool |Purpose |
|------|---------|
| React Native + Expo | Mobile app framework |
| TypeScript | Type-safe JavaScript |
| expo-sqlite | Local database on phone |
| Zustand | State management |
| Jest + fast-check | Testing |
| Docker | Containerization |
---
## How to Run

### Local Development
```bash
npm install
npm run dev

# Tests
npm test
npm run test:coverage

# Lint
npm run lint
npm run lint:fix
```

### With Docker
```bash
docker build -t bloom-app .
docker run -p 8088:8088 bloom-app
```

Then open Expo Go on your phone / an Emulator and connect to `exp://[your-ip]:8088`

---
## Python to TypeScript Equivalencies

|Python |TypeScript/JS |What We Use |
|--------|---------------|-------------|
| `hypothesis` | `fast-check` | Property-based testing |
| `unittest.mock.patch` | `jest.mock()` | Mock external modules |
| `unittest.mock.Mock` | `jest.fn()` | Create mock functions |
| `mypy` | `tsc --noEmit` | Type checking |
| `pep8/flake8` | `eslint` | Code style |
| `coverage.py` | `jest --coverage` | Code coverage |

---
