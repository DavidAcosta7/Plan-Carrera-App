# 🔍 AUDIT REPORT: AI INTEGRATION COMPLIANCE
**Plan Carrera Dashboard - Claude IA Integration**

**Auditor:** Technical Senior Architect (AI Systems Specialist)  
**Date:** January 29, 2026  
**Status:** ⚠️ **CRITICAL ISSUES FOUND**  
**Compliance Level:** 35/100 (Failing)  

---

## EXECUTIVE SUMMARY

This audit reveals **significant gaps** between the implemented system and required strict specifications. While Claude integration exists, the system **fails to enforce context permanence, fails to guarantee plan structure consistency, and lacks a persistent AI bot persona**.

**Key Finding:** The IA can "escape" context, generate structurally invalid plans, and respond as a generic assistant instead of a contextual career coach.

---

## 1. RULES COMPLIANCE MATRIX

| Rule | Status | Compliance | Issue |
|------|--------|-----------|-------|
| 1. Permanent Context | ❌ FAILED | 10% | No system prompt anchoring IA to dashboard |
| 2. Exact Plan Structure (5 phases min) | ⚠️ PARTIAL | 50% | Validates presence but not count |
| 3. Phase Structure Obligatory | ⚠️ PARTIAL | 40% | Missing: exact field requirements |
| 4. IA as Contextual Bot | ❌ FAILED | 5% | Methods exist but not integrated into UI |
| 5. UX Consistency | ⚠️ PARTIAL | 60% | Chat component disconnected from plan |
| **OVERALL** | **❌ CRITICAL** | **35%** | **Multiple critical failures** |

---

## 2. DETAILED RULE VIOLATIONS

### ❌ RULE 1: PERMANENT CONTEXT (CRITICAL)

**Status:** FAILED  
**Severity:** CRITICAL  
**Compliance:** 10%

#### Problem
There is **NO system prompt or global context** anchoring Claude to the dashboard. The IA can be prompted to:
- Act as a generic consultant
- Ignore the dashboard context
- Generate plans outside the career planning domain
- Respond as if the user is outside the Plan Carrera platform

#### Code Evidence

**In `utils/ai-service.js` - Line 96-102:**
```javascript
async callClaude(prompt, systemPrompt = null) {
    // ❌ systemPrompt parameter exists but is NEVER USED
    const body = {
        model: this.model,
        max_tokens: this.maxTokens,
        messages: [
            {
                role: 'user',
                content: prompt
                // ❌ NO system role with persistent context
            }
        ]
    };
```

**Missing Implementation:**
```javascript
// SHOULD BE:
messages: [
    {
        role: 'user',
        content: "You are ONLY a technical assistant within Plan Carrera dashboard..."
    },
    {
        role: 'user', 
        content: prompt
    }
]
```

**In `components/chat.html` - Line 145-160:**
```javascript
const response = await claudeAPI.chat(message, fullContext);
// ❌ fullContext is just message history, NOT a persistent system context
// ❌ No enforced role or scope limitation
```

#### Risk
- User asks Claude: "Forget about plans, help me with X"
- Claude complies (no system prompt prevents this)
- IA escapes dashboard context

#### Impact
- ❌ IA can hallucinate non-plan-related content
- ❌ Inconsistent assistant behavior across sessions
- ❌ No safety guardrail against context drift

#### Remediation Required

**CRITICAL FIX:**
```javascript
async callClaude(prompt, userContext = {}) {
    const systemPrompt = `You are Claude, a technical career coach AI embedded in the "Plan Carrera" dashboard.

PERMANENT CONTEXT:
- Location: Career planning dashboard (plan.carrera.app)
- Your role: Help users with their specific career plan
- You NEVER:
  * Pretend to be outside this dashboard
  * Answer questions unrelated to career learning
  * Generate content beyond plan scope
  * Provide generic career advice (only contextual advice)

CURRENT CONTEXT:
- Plan: ${userContext.planTitle || 'Not selected'}
- Phase: ${userContext.phaseTitle || 'Not specified'}
- User Level: ${userContext.userLevel || 'unknown'}

Always respond as the Plan Carrera technical assistant. If asked something outside scope, redirect to plan context.`;

    const messages = [
        { role: 'user', content: systemPrompt },
        { role: 'assistant', content: 'Understood. I am Claude, the Plan Carrera assistant.' },
        { role: 'user', content: prompt }
    ];
    
    // ... rest of API call
}
```

---

### ⚠️ RULE 2: EXACT PLAN STRUCTURE (PARTIAL FAILURE)

**Status:** PARTIALLY IMPLEMENTED  
**Severity:** HIGH  
**Compliance:** 50%

#### Problem
Plans must have **EXACTLY 5 phases** (ni más ni menos). The system:
- ✅ Validates "phases must exist"
- ❌ Does NOT validate "phases must be exactly 5"
- ❌ Allows 4-6 phases per prompt (inconsistent)

#### Code Evidence

**In `utils/ai-service.js` - Line 108-120 (buildCareerPlanPrompt):**
```javascript
buildCareerPlanPrompt(answers) {
    return `...
2. 4-6 learning phases (progressive difficulty)
    // ❌ WRONG: Should be EXACTLY 5
    // ❌ Prompt allows flexibility, Claude may return 4 or 6
```

**In `utils/ai-service.js` - Line 256-275 (validatePlanStructure):**
```javascript
validatePlanStructure(plan) {
    // ✅ Validates existence
    if (!Array.isArray(plan.phases) || plan.phases.length === 0) {
        throw new Error('Plan must have at least one phase');
    }
    
    // ❌ MISSING: Validate EXACTLY 5 phases
    // Should have:
    // if (plan.phases.length !== 5) {
    //     throw new Error('Plan must have EXACTLY 5 phases, got ' + plan.phases.length);
    // }
```

#### Scenario
User answers questions → Claude generates plan with 4 phases → Validation passes → Dashboard shows 4 phases

**Expected:** Error and regeneration  
**Actual:** Silent acceptance

#### Metrics Missing
The plan structure requires these visible metrics:
- ✅ Total progress
- ❌ Missing: Fases completadas (0/5) - HARDCODED TO 5
- ❌ Missing: Proyectos terminados (0/15) - calculated but not displayed

#### Remediation Required

```javascript
// In validatePlanStructure()
validatePlanStructure(plan) {
    // ... existing checks ...
    
    // NEW: Enforce exactly 5 phases
    if (plan.phases.length !== 5) {
        throw new Error(
            `Plan must have EXACTLY 5 phases. Received ${plan.phases.length}.`
        );
    }
    
    // NEW: Validate totalPhases field
    if (plan.totalPhases !== 5) {
        plan.totalPhases = 5; // Force correction
    }
    
    // NEW: Validate phase count consistency
    if (plan.phases.length !== plan.totalPhases) {
        throw new Error(
            `Phase count mismatch: totalPhases=${plan.totalPhases} but array has ${plan.phases.length}`
        );
    }
    
    return true;
}

// In buildCareerPlanPrompt()
buildCareerPlanPrompt(answers) {
    return `...
2. EXACTLY 5 learning phases (not 4, not 6, EXACTLY 5)
    
    PHASES MUST BE:
    1. Foundation
    2. Intermediate
    3. Advanced
    4. Specialization
    5. Integration & Portfolio
...`;
}
```

---

### ❌ RULE 3: PHASE STRUCTURE OBLIGATION (CRITICAL FAILURE)

**Status:** FAILED  
**Severity:** CRITICAL  
**Compliance:** 40%

#### Problem
Each phase MUST include exactly these sections:

| Section | Status | Evidence |
|---------|--------|----------|
| Nombre | ✅ Present | `phase.title` |
| Duración | ✅ Present | `phase.duration` |
| Contador (0/3) | ❌ MISSING | Not in schema |
| Qué aprenderás | ✅ Present | `phase.topics` |
| Cursos/Recursos | ⚠️ PARTIAL | `phase.resources` but optional |
| Proyectos GitHub | ⚠️ PARTIAL | `phase.projects` but structure varies |

#### Code Evidence

**Expected Structure (per rules):**
```javascript
{
  id: 1,
  title: "Phase Name",
  duration: "4-6 weeks",
  counter: { completed: 0, total: 3 },  // ❌ MISSING
  
  learning: [  // "Qué aprenderás"
    "Skill 1",
    "Skill 2"
  ],
  
  resources: [  // "Cursos/Recursos" (REQUIRED)
    {
      title: "Course Name",
      type: "course|book|tutorial",
      url: "https://...",
      isFree: true
    }
  ],
  
  projects: [  // "Proyectos para GitHub" (EXACTLY 3)
    {
      id: "easy-project",
      title: "Project Name",
      description: "What you build",
      difficulty: "easy",
      what_practiced: ["skill1", "skill2"],
      requirements: ["req1", "req2"],
      githubRequirements: {
        code: true,
        data: false,
        documentation: true
      }
    },
    // ... medium ...
    // ... hard ...
  ]
}
```

**Actual Structure (from `ai-service.js` line 156-178):**
```javascript
{
  "id": 1,
  "title": "Phase Title",
  "duration": "X-Y weeks",
  "icon": "appropriate-icon-name",  // ❌ Not required, adds noise
  "color": "bg-color-500",          // ❌ Not required, UI concern
  "learning_objectives": ["objective1", "objective2"],  // ✅ Correct
  "topics": ["topic1", "topic2"],   // ✅ Correct
  "projects": [                      // ⚠️ Partial
    {
      "id": "project-id",
      "title": "📊 Project Title",
      "description": "What you'll build",
      "difficulty": "easy|medium|hard",
      "estimatedTime": "X hours",
      "requirements": ["req1", "req2"],
      "githubTips": "How to present on GitHub"  // ⚠️ Too vague, needs structure
    }
  ],
  "resources": [                     // ✅ Correct
    {
      "title": "Resource Name",
      "type": "course|book|tutorial|free",
      "url": "https://..."
    }
  ],
  "practice": "Specific practice recommendations"  // ✅ OK but optional
}
```

#### Missing/Malformed Elements

**1. Project Counter (0/3) - MISSING**
```javascript
// ❌ MISSING in schema
// Should add to each phase:
"projectCounter": {
  "completed": 0,
  "total": 3,
  "required": true
}
```

**2. Resources - Not Validated**
```javascript
// ❌ resources array doesn't validate:
// - Must have AT LEAST 1 free resource
// - Must have mix of platforms
// - type field is not enforced

// Should enforce:
resources: [
  {
    title: "Required",
    type: "course|book|tutorial|free", // Must validate
    url: "https://...",
    isFree: true, // At least one must be true
    platform: "Udemy|Coursera|Codecademy|FreeCodeCamp" // Must specify
  }
]
```

**3. Projects Structure - Incomplete**
```javascript
// ❌ Current:
"githubTips": "How to present on GitHub"  // Just text, no structure

// Should be:
"githubRequirements": {
  "code": true,           // Must have code
  "data": false,          // Optional data files
  "documentation": true,  // Must have README
  "git_commits": true,    // Clean commit history
  "examples": "code examples or screenshots"
}
```

**4. "What You Practice" - Missing**
```javascript
// ❌ Missing "what_practiced" field
// Should document:
{
  id: "project-id",
  what_practiced: [
    "Array manipulation",
    "API integration",
    "Error handling"
  ]
}
```

#### Validation Code - MISSING
```javascript
// ❌ Current code has no validation
validatePlanStructure(plan) {
    // Only checks existence, not structure
    // Missing:
    // - Resource count (min 1)
    // - Resource types
    // - Project count per phase (must be 3)
    // - Project field structure
    // - githubRequirements validation
}
```

#### Remediation Required

```javascript
validatePlanStructure(plan) {
    const requiredFields = ['title', 'description', 'phases'];
    
    // ... existing checks ...
    
    // NEW: Validate phases
    if (plan.phases.length !== 5) {
        throw new Error(`Must have exactly 5 phases, got ${plan.phases.length}`);
    }
    
    plan.phases.forEach((phase, index) => {
        // Check required fields
        const requiredPhaseFields = [
            'id', 'title', 'duration', 'topics', 'resources', 'projects'
        ];
        
        requiredPhaseFields.forEach(field => {
            if (!(field in phase)) {
                throw new Error(
                    `Phase ${index + 1} missing required field: ${field}`
                );
            }
        });
        
        // NEW: Validate projects count
        if (!Array.isArray(phase.projects) || phase.projects.length !== 3) {
            throw new Error(
                `Phase ${index + 1} must have EXACTLY 3 projects, got ${
                    phase.projects?.length || 0
                }`
            );
        }
        
        // NEW: Validate each project
        const difficulties = ['easy', 'medium', 'hard'];
        phase.projects.forEach((project, pIdx) => {
            if (!project.title || !project.description) {
                throw new Error(
                    `Phase ${index + 1}, Project ${pIdx + 1} missing title/description`
                );
            }
            
            if (!difficulties.includes(project.difficulty)) {
                throw new Error(
                    `Phase ${index + 1}, Project ${pIdx + 1} invalid difficulty`
                );
            }
            
            if (!Array.isArray(project.requirements) || project.requirements.length === 0) {
                throw new Error(
                    `Phase ${index + 1}, Project ${pIdx + 1} must have requirements`
                );
            }
            
            if (!project.githubRequirements || typeof project.githubRequirements !== 'object') {
                throw new Error(
                    `Phase ${index + 1}, Project ${pIdx + 1} missing githubRequirements`
                );
            }
        });
        
        // NEW: Validate resources
        if (!Array.isArray(phase.resources) || phase.resources.length < 1) {
            throw new Error(
                `Phase ${index + 1} must have at least 1 resource`
            );
        }
        
        const hasFreeResource = phase.resources.some(r => r.isFree);
        if (!hasFreeResource) {
            throw new Error(
                `Phase ${index + 1} must have at least 1 free resource`
            );
        }
    });
    
    return true;
}
```

---

### ⚠️ RULE 4: IA AS CONTEXTUAL BOT (NEAR-TOTAL FAILURE)

**Status:** FAILED  
**Severity:** HIGH  
**Compliance:** 5%

#### Problem
The IA has methods for contextual behavior but **NONE ARE INTEGRATED INTO THE UI**. The bot exists only theoretically.

#### Code Evidence

**Methods Exist (unused):**
```javascript
// In utils/ai-service.js lines 379-432

async answerPlanQuestion(plan, phase, question) {
    // ✅ Method exists
    // ❌ Never called from UI
    // ❌ No chat integration
}

async getProjectAdvice(projectTitle, difficulty, userLevel) {
    // ✅ Method exists
    // ❌ Never called from UI
}

async getNextStepRecommendation(plan, currentProgress) {
    // ✅ Method exists
    // ❌ Never called from UI
}
```

**UI Integration - MISSING:**
```javascript
// In pages/dashboard.html line 294-299
function loadChatComponent() {
    // ❌ STUB: Does nothing
    const chatComponent = document.getElementById('chatComponent');
    if (chatComponent && currentPlan) {
        // TODO: Implement
        // Actual code: empty
    }
}
```

**Chat Component - Disconnected:**
```javascript
// In components/chat.html line 115-140

async function sendToClaude(message) {
    const contextInfo = user ? {
        currentPhase: user.plan?.phases?.find(...),  // ❌ Gets currentPhase
        completedProjects: user.progress.completedProjects.length,
        goal: user.plan?.description
    } : {};
    
    // ❌ Context is built but NOT PASSED to aiService methods
    // ❌ Just calls generic claudeAPI.chat()
    const response = await claudeAPI.chat(message, fullContext);
    // ❌ Uses legacy claudeAPI, not aiService
}
```

#### Expected Behavior

When user in dashboard at Phase 2:
- **User asks:** "¿Qué proyecto debería hacer ahora?"
- **Should call:** `aiService.getNextStepRecommendation(currentPlan, currentProgress)`
- **Response:** Specific to current progress
- **Example:** "Completa el proyecto 2 de la Fase 2. Como ya aprendiste arrays, enfócate en..."

**Actual Behavior:**
- Generic chat window opens
- User question goes to generic Claude
- Response might suggest skipping phases or unrelated topics

#### Broken Workflow

1. User clicks "New Plan" → Redirects to `/onboarding`
2. Completes 5 questions → Claude generates plan
3. Plan saved to Supabase
4. User returns to dashboard → Sees plan card
5. **Clicks plan card** → Currently redirects to `/plan/[id]` (PAGE NOT BUILT)
6. Chat component exists but is empty
7. Chat component is never wired to `answerPlanQuestion()`

#### Missing Views

- ❌ `/plan/[id]` page - doesn't exist
- ❌ Plan detail view with phase breakdown
- ❌ Project detail view
- ❌ Chat integration with plan context
- ❌ Progress tracking UI

#### Remediation Required

**Priority 1: Create Plan Detail Page**
```html
<!-- pages/plan-detail.html -->
<div class="plan-detail-page">
  <div class="plan-header">
    <h1 id="planTitle"></h1>
    <div class="plan-metrics">
      <span>Progreso: <span id="progressBar"></span></span>
      <span>Fases: <span id="phasesCompleted">0</span>/5</span>
      <span>Proyectos: <span id="projectsCompleted">0</span>/15</span>
    </div>
  </div>
  
  <div class="plan-content">
    <div id="phasesContainer"></div>
  </div>
  
  <div id="chatPanel">
    <!-- Chat integrated with plan context -->
  </div>
</div>
```

**Priority 2: Wire Chat to Context**
```javascript
async function sendPlanContextualQuestion(message) {
    const plan = currentPlan;
    const phase = currentPhase;
    
    // Use aiService contextual methods
    let response;
    
    if (message.includes("next") || message.includes("siguiente")) {
        response = await aiService.getNextStepRecommendation(plan, progress);
    } else if (message.includes("project") || message.includes("proyecto")) {
        response = await aiService.getProjectAdvice(
            phase.projects[0].title,
            'medium',
            currentUserLevel
        );
    } else {
        response = await aiService.answerPlanQuestion(plan, phase, message);
    }
    
    displayChatResponse(response);
}
```

---

### ⚠️ RULE 5: UX EXPERIENCE (PARTIAL)

**Status:** PARTIAL  
**Severity:** MEDIUM  
**Compliance:** 60%

#### Issues

**1. Disconnected Chat Component**
- Chat exists in `components/chat.html`
- Never loads in dashboard
- No context from plan
- Can't help with specific projects

**2. Empty Function Stubs**
```javascript
// In dashboard.html
function loadChatComponent() {
    // Empty
}

function editPlan(planId) {
    showNotification('Funcionalidad de edición próximamente', 'info');
    // Not implemented
}
```

**3. Missing Pages**
- Plan detail view not implemented
- Project detail view not implemented
- Progress tracking UI missing
- No way to mark progress

**4. Tone Issues**
The initial chat message tries to act as a bot:
```javascript
// In components/chat.html line 23-27
<p>¡Hola! Soy Claude, tu asistente de aprendizaje. Estoy aquí para 
ayudarte con tu plan de carrera, resolver dudas técnicas...</p>
// ✅ Tone is correct
// ❌ But logic doesn't enforce this
```

---

## 3. RISK ASSESSMENT

### Critical Risks (Must Fix Before Production)

#### Risk 1: Context Escape ⚠️ CRITICAL
**Likelihood:** High  
**Impact:** Loss of system coherence  
**Description:** User can ask Claude to ignore dashboard context  
**Mitigation:** Implement system prompt (see Rule 1 fix)

#### Risk 2: Invalid Plan Generation ⚠️ CRITICAL
**Likelihood:** Medium  
**Impact:** Database inconsistency  
**Description:** Claude generates 4 or 6 phases, validation passes silently  
**Mitigation:** Enforce strict validation (see Rule 2 fix)

#### Risk 3: Incomplete Project Structure ⚠️ CRITICAL
**Likelihood:** High  
**Impact:** Projects don't meet requirements  
**Description:** Projects might be missing GitHub requirements or methodology  
**Mitigation:** Validate project structure rigorously (see Rule 3 fix)

#### Risk 4: Bot Unusable ⚠️ HIGH
**Likelihood:** Certain  
**Impact:** Feature doesn't work  
**Description:** Chat component exists but isn't integrated  
**Mitigation:** Complete UI implementation (see Rule 4 fix)

### Medium Risks

#### Risk 5: Multiple Service Versions
**Current State:**
- `utils/ai-service.js` (NEW, correct)
- `utils/claude.js` (OLD, fallback)
- `components/chat.html` uses `claudeAPI.chat()` (legacy)

**Problem:**
- Chat uses old service, not new service
- Different prompt structures
- Inconsistent responses

**Mitigation:** Remove `claude.js`, consolidate to `ai-service.js`

---

## 4. DETAILED RECOMMENDATIONS

### Fix Priority

| Priority | Item | Effort | Impact |
|----------|------|--------|--------|
| P1 | Add system prompt to `callClaude()` | 30 min | Critical |
| P1 | Validate exactly 5 phases | 20 min | Critical |
| P1 | Validate phase structure rigorously | 1 hour | Critical |
| P2 | Create plan detail page | 4 hours | High |
| P2 | Integrate chat with contextual methods | 2 hours | High |
| P3 | Remove legacy `claude.js` | 30 min | Medium |
| P3 | Implement project detail view | 2 hours | Medium |
| P4 | Add plan refinement UI | 3 hours | Low |

---

## 5. CHECKLIST FOR PRODUCTION

### Before Going Live

- [ ] **System Prompt Implemented**
  - [ ] `callClaude()` has persistent context
  - [ ] Context tested to prevent escape
  - [ ] System role used in API call

- [ ] **Plan Validation Strict**
  - [ ] Exactly 5 phases enforced
  - [ ] Phase counter (0/3) validated
  - [ ] Projects exactly 3 per phase
  - [ ] Resources min 1, with free option
  - [ ] All GitHub requirements structured

- [ ] **Chat Integrated**
  - [ ] Chat loads in dashboard
  - [ ] `answerPlanQuestion()` called
  - [ ] `getNextStepRecommendation()` callable
  - [ ] Context passed correctly

- [ ] **Plan Detail Page Built**
  - [ ] Shows all 5 phases
  - [ ] Progress tracking visible
  - [ ] Project cards show details
  - [ ] Chat accessible from page

- [ ] **Legacy Code Removed**
  - [ ] `claude.js` deleted
  - [ ] All references to `claudeAPI` removed
  - [ ] Using only `aiService`

- [ ] **Error Handling**
  - [ ] Invalid plans caught
  - [ ] User sees clear error
  - [ ] Regeneration offered
  - [ ] No silent failures

- [ ] **Testing Complete**
  - [ ] Manual: Generate plan, verify 5 phases
  - [ ] Manual: Check each phase has 3 projects
  - [ ] Manual: Open chat, ask contextual question
  - [ ] Automated: Plan structure validation tests
  - [ ] Security: Try context escape, verify it fails

---

## 6. IMPLEMENTATION ROADMAP

### Phase 1: Critical Fixes (Day 1)
1. **Add System Prompt**
   - File: `utils/ai-service.js`
   - Method: `callClaude()`
   - Test: Context isolation test

2. **Strict Validation**
   - File: `utils/ai-service.js`
   - Method: `validatePlanStructure()`
   - Add: Phase count check, project count check
   - Test: Validation test suite

3. **Update Prompt**
   - File: `utils/ai-service.js`
   - Method: `buildCareerPlanPrompt()`
   - Change: "4-6 phases" → "EXACTLY 5 phases"

### Phase 2: UI Integration (Day 2)
4. **Plan Detail Page**
   - Create: `pages/plan-detail.html`
   - Router integration: Handle `/plan/[id]`
   - Display all 5 phases with metrics

5. **Chat Integration**
   - File: `components/chat.html`
   - Update: Use `aiService` instead of `claudeAPI`
   - Add: Context passing from plan view

6. **Progress Tracking**
   - Create: Mark phase/project as complete
   - Update: Dashboard metrics

### Phase 3: Cleanup (Day 3)
7. **Remove Legacy Code**
   - Delete: `utils/claude.js`
   - Update: Remove `claudeAPI` references
   - Test: No regressions

8. **Error Handling**
   - Implement: Plan generation error recovery
   - Test: Manual invalid plan scenarios

9. **Documentation**
   - Update: Prompt specifications
   - Add: Validation rules documentation

---

## 7. TECHNICAL DEBT

### Immediate
- System prompt missing from AI calls
- Phase validation incomplete
- Plan detail page doesn't exist
- Chat not integrated with plan context

### Short-term
- Multiple service versions (ai-service.js + claude.js)
- No testing framework for plan structure validation
- No error tracking for plan generation failures

### Long-term
- Chat component needs redesign for dashboard integration
- Project detail view needs building
- Progress persistence needs audit
- Export/sharing features needed

---

## 8. CONCLUSION

**Overall Assessment:** ⚠️ **NOT PRODUCTION READY**

The system has:
- ✅ Functional Claude API integration
- ✅ Database schema in place
- ✅ UI framework with chat component
- ❌ Missing critical context enforcement
- ❌ Insufficient validation strictness
- ❌ Incomplete UI/UX integration
- ❌ Risk of plan generation failures

**Estimated Time to Fix:** 2-3 days (full-stack implementation)

**Risk Level:** HIGH - Production deployment would expose users to invalid plans and context escape scenarios

**Recommendation:** Complete all P1 fixes before launch. Review with QA before production deployment.

---

**Generated by:** Technical Senior Architect  
**Review Status:** Pending Implementation  
**Next Review Date:** After all P1 fixes are deployed  

