# timely

## Installation

To install dependencies:

```bash
bun install
```

## Development

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.2.15. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

## Contribution

# AI Agent Contribution Workflow

### Phase 1: Requirements & Validation

1. **Clarify the request**

   - Parse and understand the requirement
   - Ask clarifying questions for ambiguous aspects
   - Validate feasibility and alignment with project goals
   - Confirm sufficient detail exists to proceed

2. **Scope and impact assessment**
   - Define clear acceptance criteria
   - Identify affected components and dependencies
   - Assess potential breaking changes
   - Estimate complexity and risk level

### Phase 2: Planning & Design

3. **Create implementation plan**

   - Break down into discrete, testable steps
   - Map dependencies between components
   - Identify required documentation updates
   - Plan testing strategy (unit, integration, e2e)
   - Consider security implications
   - Plan rollback strategy for high-risk changes

4. **Create GitHub issue**

   - Document requirements, scope, and acceptance criteria
   - Include implementation approach and testing plan
   - Tag with appropriate labels and assignees

5. **Validate plan with stakeholders**
   - Confirm GitHub issue accuracy
   - Get feedback on approach and scope
   - Update plan based on input
   - Ensure alignment before implementation

### Phase 3: Implementation (Iterative)

6. **Create feature branch** using GitHub issue number

7. **For each implementation step:**

   - **Implement code changes**
   - **Add comprehensive tests** (unit, integration as needed)
   - **Update documentation** (code comments, README, API docs)
   - **Test functionality** in isolation
   - **Run full test suite** to verify no regressions
   - **Security review** (input validation, auth, data handling)
   - **Performance check** for critical paths
   - **Self code review** (completeness, maintainability, production readiness)
   - **Commit changes** with descriptive messages

   _If blockers discovered: pause, reassess plan, update GitHub issue if needed_

### Phase 4: Integration & Review

8. **Pre-PR validation**

   - Final full test suite run
   - Documentation completeness check
   - Verify all acceptance criteria met
   - Confirm CI/CD configurations updated if needed

9. **Create pull request**

   - Link to GitHub issue
   - Provide clear description of changes
   - Include testing evidence
   - Request appropriate reviewers

10. **Address review feedback**
    - Iterate based on peer review
    - Update tests and documentation as needed
    - Ensure final approval before merge
