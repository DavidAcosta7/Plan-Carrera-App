# ✅ AUDIT ACTION ITEMS - QUICK REFERENCE

**Generated:** January 29, 2026  
**Status:** Ready for Implementation  
**Owner:** Engineering Team  

---

## 🔴 CRITICAL (Must Fix Before Production)

### [CRITICAL #1] System Prompt Not Enforced
- **File:** `utils/ai-service.js`
- **Method:** `callClaude()`
- **Issue:** AI can escape dashboard context
- **Fix:** Add system prompt anchor to all Claude calls
- **Effort:** 30 minutes
- **Risk:** Low
- **Status:** Not Started ☐

**Quick Action:**
```javascript
// In callClaude(), update messages array:
messages: [
    { role: 'user', content: SYSTEM_CONTEXT }, // NEW
    { role: 'assistant', content: 'Understood...' }, // NEW
    { role: 'user', content: prompt } // EXISTING
]
```

---

### [CRITICAL #2] Phase Count Not Validated
- **File:** `utils/ai-service.js`
- **Method:** `validatePlanStructure()`
- **Issue:** Claude can generate 4 or 6 phases, validation passes
- **Fix:** Add `if (plan.phases.length !== 5)` check
- **Effort:** 45 minutes
- **Risk:** Medium (may break existing plans)
- **Status:** Not Started ☐

**Quick Action:**
```javascript
if (plan.phases.length !== 5) {
    throw new Error(`Plan must have EXACTLY 5 phases, got ${plan.phases.length}`);
}
```

---

### [CRITICAL #3] Project Count Not Validated
- **File:** `utils/ai-service.js`
- **Method:** `validatePlanStructure()` 
- **Issue:** Each phase should have EXACTLY 3 projects, not validated
- **Fix:** Add project count check per phase
- **Effort:** 45 minutes
- **Risk:** Medium
- **Status:** Not Started ☐

**Quick Action:**
```javascript
phase.projects.forEach((project, pIdx) => {
    // ... existing validation ...
});

if (phase.projects.length !== 3) {
    throw new Error(`Phase ${phaseNum} must have EXACTLY 3 projects, got ${phase.projects.length}`);
}
```

---

### [CRITICAL #4] Prompt Doesn't Enforce 5 Phases
- **File:** `utils/ai-service.js`
- **Method:** `buildCareerPlanPrompt()`
- **Issue:** Prompt says "4-6 phases", should say "EXACTLY 5"
- **Fix:** Change prompt text
- **Effort:** 20 minutes
- **Risk:** Low
- **Status:** Not Started ☐

**Quick Action:**
Find line ~108:
```
BEFORE: 2. 4-6 learning phases (progressive difficulty)
AFTER:  2. EXACTLY 5 learning phases (no more, no less)
```

---

### [CRITICAL #5] Plan Detail Page Missing
- **File:** Create `pages/plan-detail.html`
- **Issue:** Users can't view generated plans
- **Fix:** Build page that shows all 5 phases + 15 projects + metrics
- **Effort:** 4 hours
- **Risk:** Medium (new page)
- **Status:** Not Started ☐

**Must Include:**
- [ ] Plan title and description
- [ ] Progress metrics (0/5 phases, 0/15 projects)
- [ ] All 5 phases visible
- [ ] Each phase shows 3 projects (easy, medium, hard)
- [ ] Resources list per phase
- [ ] Chat panel with plan context

---

### [CRITICAL #6] Chat Not Connected to Plan Context
- **File:** `components/chat.html`
- **Issue:** Chat exists but doesn't use `aiService` contextual methods
- **Fix:** Wire chat to `answerPlanQuestion()`, `getNextStepRecommendation()`, etc.
- **Effort:** 2 hours
- **Risk:** Medium
- **Status:** Not Started ☐

**Quick Action:**
```javascript
// In sendToClaude(), replace generic call with:
if (message.includes('next')) {
    response = await aiService.getNextStepRecommendation(plan, progress);
} else {
    response = await aiService.answerPlanQuestion(plan, phase, message);
}
```

---

## 🟡 HIGH (Should Fix Before Production)

### [HIGH #1] Legacy Service Not Removed
- **File:** `utils/claude.js`
- **Issue:** Two AI services cause confusion, legacy one used by chat
- **Fix:** Delete `claude.js` and consolidate to `ai-service.js`
- **Effort:** 30 minutes
- **Risk:** Low (if migration is clean)
- **Status:** Not Started ☐

**Quick Action:**
```bash
rm utils/claude.js
grep -r "claudeAPI" --include="*.html" --include="*.js" .
# Replace all with "aiService"
grep -r "import.*claude.js" --include="*.html" .
# Remove script tags
```

---

### [HIGH #2] Multiple Service Versions
- **File:** `index.html`
- **Issue:** Both `ai-service.js` and `claude.js` loaded
- **Fix:** Remove `claude.js` import
- **Effort:** 5 minutes
- **Risk:** Low
- **Status:** Not Started ☐

---

## 🟠 MEDIUM (Nice to Have)

### [MEDIUM #1] No Test Suite for Validation
- **File:** Create `tests/validation.test.js`
- **Issue:** Plan validation not covered by tests
- **Fix:** Add unit tests
- **Effort:** 2 hours
- **Risk:** Low
- **Status:** Not Started ☐

---

## IMPLEMENTATION ORDER

**Day 1:**
1. ✅ System prompt enforcement (30 min)
2. ✅ Phase validation (45 min)
3. ✅ Project validation (45 min)
4. ✅ Prompt update (20 min)
5. ✅ Legacy cleanup (30 min)
6. ✅ Test critical path (1 hour)

**Day 2:**
7. ✅ Plan detail page (4 hours)

**Day 3:**
8. ✅ Chat integration (2 hours)
9. ✅ Full QA (2-3 hours)

---

## SUCCESS CRITERIA

After implementing all fixes:

- [ ] System prompt prevents context escape (verified with test)
- [ ] Plans MUST have exactly 5 phases (validated)
- [ ] Plans have exactly 3 projects per phase (validated)
- [ ] Plan detail page loads and shows all content
- [ ] Chat uses contextual AI methods (verified with interaction test)
- [ ] No references to legacy `claude.js`
- [ ] All error messages are clear and actionable
- [ ] Database migration (if needed) complete
- [ ] QA sign-off on all features
- [ ] Performance acceptable (load times <2s)

---

## RISK MITIGATION

### Rollback Plan
If critical issues after deployment:
```bash
git revert <commit-hash>
# OR if necessary
git checkout <previous-tag>
# Redeploy to production
```

### Deployment Strategy
1. Test in staging environment first
2. Deploy to beta users (10%)
3. Monitor for 24 hours
4. If stable, roll out to 100%
5. Keep monitoring for 1 week

### Monitoring
- [ ] Plan generation success rate (target: >99%)
- [ ] Error rate (target: <0.1%)
- [ ] Performance metrics
- [ ] User feedback

---

## SIGN-OFF REQUIRED FROM

- [ ] **Engineering Lead** - Approve implementation plan
- [ ] **QA Manager** - Approve test strategy
- [ ] **DevOps** - Approve deployment plan
- [ ] **Product Manager** - Approve timeline

---

## TRACKING

Update status in this table as you progress:

| Task | Status | Owner | ETA | Notes |
|------|--------|-------|-----|-------|
| System Prompt | ☐ | - | - | - |
| Phase Validation | ☐ | - | - | - |
| Project Validation | ☐ | - | - | - |
| Prompt Update | ☐ | - | - | - |
| Legacy Cleanup | ☐ | - | - | - |
| Plan Detail Page | ☐ | - | - | - |
| Chat Integration | ☐ | - | - | - |
| Testing | ☐ | - | - | - |
| QA Sign-off | ☐ | - | - | - |
| Deployment | ☐ | - | - | - |

---

**Last Updated:** January 29, 2026  
**Review Status:** Ready for Implementation  
**Next Review:** After each major phase completion  

