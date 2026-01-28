// Estado de la aplicación
const state = {
    completedPhases: [],
    completedProjects: [],
    expandedPhases: [1],
    loading: false,
    notification: null
};

// Constantes
const LOCAL_STORAGE_KEY = 'careerRoadmapProgress_v1';

// Utilidades
const getDifficultyColor = (difficulty) => {
    const colors = {
        easy: 'difficulty-easy',
        medium: 'difficulty-medium',
        hard: 'difficulty-hard'
    };
    return colors[difficulty] || 'difficulty-easy';
};

const getDifficultyLabel = (difficulty) => {
    const labels = {
        easy: '🟢 Fácil',
        medium: '🟡 Medio',
        hard: '🔴 Difícil'
    };
    return labels[difficulty] || difficulty;
};

const getPhaseColor = (color) => {
    const colorMap = {
        'bg-blue-500': 'text-blue',
        'bg-green-500': 'text-green',
        'bg-purple-500': 'text-purple',
        'bg-orange-500': 'text-orange',
        'bg-red-500': 'text-red'
    };
    return colorMap[color] || 'text-blue';
};

// Sistema de notificaciones
const showNotification = (message, duration = 3000) => {
    const notificationEl = document.getElementById('notification');
    notificationEl.textContent = message;
    notificationEl.style.display = 'block';
    
    setTimeout(() => {
        notificationEl.style.display = 'none';
    }, duration);
};

// Persistencia de datos
const saveProgress = async () => {
    state.loading = true;
    updateSaveButton();
    
    try {
        const payload = {
            savedPhases: state.completedPhases,
            savedProjects: state.completedProjects,
            lastUpdate: new Date().toISOString()
        };

        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(payload));
        showNotification('✅ Progreso guardado localmente');
    } catch (err) {
        console.error('Error guardando:', err);
        showNotification('Error al guardar progreso');
    } finally {
        state.loading = false;
        updateSaveButton();
    }
};

const loadProgress = () => {
    try {
        state.loading = true;
        const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            state.completedPhases = Array.isArray(parsed.savedPhases) ? parsed.savedPhases : [];
            state.completedProjects = Array.isArray(parsed.savedProjects) ? parsed.savedProjects : [];
            showNotification(`Progreso cargado (última actualización: ${parsed.lastUpdate || 'desconocida'})`);
        } else {
            showNotification('Bienvenido — comienza tu Plan de Carrera', 2500);
        }
    } catch (err) {
        console.error('Error leyendo progreso local:', err);
        showNotification('Error cargando progreso local');
    } finally {
        state.loading = false;
    }
};

// Autosave con debounce
let autosaveTimeout;
const autosave = () => {
    clearTimeout(autosaveTimeout);
    autosaveTimeout = setTimeout(() => {
        try {
            const payload = {
                savedPhases: state.completedPhases,
                savedProjects: state.completedProjects,
                lastUpdate: new Date().toISOString()
            };
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(payload));
        } catch (err) {
            console.error('Autosave falló:', err);
        }
    }, 2000);
};

// Toggle functions
const togglePhase = (phaseId) => {
    const index = state.completedPhases.indexOf(phaseId);
    if (index > -1) {
        state.completedPhases.splice(index, 1);
    } else {
        state.completedPhases.push(phaseId);
    }
    autosave();
    renderApp();
};

const toggleProject = (projectId) => {
    const index = state.completedProjects.indexOf(projectId);
    if (index > -1) {
        state.completedProjects.splice(index, 1);
    } else {
        state.completedProjects.push(projectId);
    }
    autosave();
    renderApp();
};

const toggleExpand = (phaseId) => {
    const index = state.expandedPhases.indexOf(phaseId);
    if (index > -1) {
        state.expandedPhases.splice(index, 1);
    } else {
        state.expandedPhases.push(phaseId);
    }
    renderApp();
};

// Lógica de desbloqueo de proyectos
const isProjectUnlocked = (phaseId, project) => {
    const phase = phases.find(p => p.id === phaseId);
    if (!phase) return false;

    const phaseCompleted = state.completedPhases.includes(phaseId);
    const projectsCompletedInPhase = phase.projects.filter(p => state.completedProjects.includes(p.id)).length;
    const itemsCompletedCount = (phaseCompleted ? phase.items.length : 0) + projectsCompletedInPhase;

    return itemsCompletedCount >= (project.unlockAt || 0);
};

// Cálculo de progreso
const calculateProgress = () => {
    const totalPhases = phases.length;
    const totalProjects = phases.reduce((acc, p) => acc + p.projects.length, 0);
    
    const phaseProgress = (state.completedPhases.length / totalPhases) * 100;
    const projectProgress = (state.completedProjects.length / totalProjects) * 100;
    
    return Math.round((phaseProgress + projectProgress) / 2);
};

// Actualizar UI del progreso
const updateProgressDashboard = () => {
    const progressPercent = calculateProgress();
    const totalProjects = phases.reduce((acc, p) => acc + p.projects.length, 0);
    
    document.getElementById('progressPercent').textContent = `${progressPercent}%`;
    document.getElementById('progressFill').style.width = `${progressPercent}%`;
    document.getElementById('phasesCompleted').textContent = `${state.completedPhases.length}/${phases.length}`;
    document.getElementById('projectsCompleted').textContent = `${state.completedProjects.length}/${totalProjects}`;
};

const updateSaveButton = () => {
    const saveBtn = document.getElementById('saveProgress');
    if (state.loading) {
        saveBtn.textContent = '⏳ Guardando...';
        saveBtn.disabled = true;
    } else {
        saveBtn.textContent = '💾 Guardar Progreso';
        saveBtn.disabled = false;
    }
};

// Render functions
const renderProjectCard = (project, phaseId) => {
    const isCompleted = state.completedProjects.includes(project.id);
    const isUnlocked = isProjectUnlocked(phaseId, project);
    
    return `
        <div class="project-card ${isCompleted ? 'completed' : isUnlocked ? 'unlocked' : 'locked'}">
            ${!isUnlocked ? `<div class="project-lock">${icons.lock}</div>` : ''}
            
            <div class="project-header">
                <span class="difficulty-badge ${getDifficultyColor(project.difficulty)}">
                    ${getDifficultyLabel(project.difficulty)}
                </span>
                <h4 class="project-title">${project.title}</h4>
            </div>
            
            <p class="project-description">${project.description}</p>
            
            <div class="project-requirements">
                <h4>Requisitos:</h4>
                <ul class="requirements-list">
                    ${project.requirements.slice(0, 3).map(req => `<li>${req}</li>`).join('')}
                    ${project.requirements.length > 3 ? `<li>+${project.requirements.length - 3} requisitos más...</li>` : ''}
                </ul>
            </div>
            
            <div class="github-tips">
                <p><strong>💡 GitHub:</strong> ${project.githubTips}</p>
            </div>
            
            <button 
                class="project-action-btn ${isCompleted ? 'completed' : isUnlocked ? 'unlocked' : 'locked'}"
                onclick="toggleProject('${project.id}')"
                ${!isUnlocked ? 'disabled' : ''}
            >
                ${isCompleted ? '✓ Completado' : isUnlocked ? 'Marcar como hecho' : `🔒 Desbloquea tras ${project.unlockAt} items`}
            </button>
        </div>
    `;
};

const renderPhase = (phase, index) => {
    const isExpanded = state.expandedPhases.includes(phase.id);
    const phaseCompleted = state.completedPhases.includes(phase.id);
    const phaseProjectsCompleted = phase.projects.filter(p => state.completedProjects.includes(p.id)).length;
    const iconColor = getPhaseColor(phase.color);
    
    return `
        <div class="phase">
            ${index < phases.length - 1 ? `<div class="phase-connector"></div>` : ''}
            
            <div class="phase-icon ${phase.color}">
                ${phaseCompleted ? icons['check-circle'] : icons[phase.icon]}
            </div>
            
            <div class="phase-card ${phaseCompleted ? 'completed' : ''}">
                <div class="phase-header" onclick="toggleExpand(${phase.id})">
                    <div class="phase-header-content">
                        <div>
                            <h2 class="phase-title">${phase.title}</h2>
                            <p class="phase-meta">⏱️ ${phase.duration} • ${phaseProjectsCompleted}/${phase.projects.length} proyectos</p>
                        </div>
                        <div class="phase-actions">
                            <button 
                                class="phase-toggle-btn ${phaseCompleted ? 'completed' : ''}"
                                onclick="event.stopPropagation(); togglePhase(${phase.id})"
                                aria-pressed="${phaseCompleted}"
                            >
                                ${phaseCompleted ? '✓ Completado' : 'Marcar'}
                            </button>
                            <button class="expand-btn">
                                ${isExpanded ? icons['chevron-up'] : icons['chevron-down']}
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="phase-content ${isExpanded ? 'expanded' : ''}">
                    <div class="learning-grid">
                        <div class="learning-section">
                            <h3 class="${iconColor}">
                                ${icons.book} Qué aprenderás
                            </h3>
                            <ul class="learning-list">
                                ${phase.items.map(item => `<li>${item}</li>`).join('')}
                            </ul>
                        </div>
                        
                        <div class="learning-section">
                            <h3>📚 Cursos</h3>
                            <ul class="course-list">
                                ${phase.courses.map(course => `<li>${course}</li>`).join('')}
                            </ul>
                            <div class="practice-box">
                                <p>💪 ${phase.practice}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="projects-section">
                        <h3 class="projects-title">
                            ${icons.github} Proyectos para GitHub
                        </h3>
                        <div class="projects-grid">
                            ${phase.projects.map(project => renderProjectCard(project, phase.id)).join('')}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
};

const renderApp = () => {
    // Renderizar fases
    const phasesContainer = document.getElementById('phasesContainer');
    phasesContainer.innerHTML = phases.map((phase, index) => renderPhase(phase, index)).join('');
    
    // Actualizar dashboard
    updateProgressDashboard();
    updateSaveButton();
};

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    // Cargar progreso guardado
    loadProgress();
    
    // Renderizar aplicación
    renderApp();
    
    // Configurar evento de guardado manual
    document.getElementById('saveProgress').addEventListener('click', saveProgress);
});

// Hacer funciones globales para onclick handlers
window.togglePhase = togglePhase;
window.toggleProject = toggleProject;
window.toggleExpand = toggleExpand;
window.saveProgress = saveProgress;
