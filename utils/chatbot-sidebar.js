/**
 * Chatbot Sidebar - Integración con IA en el dashboard
 * Prioridad: 1) Backend API (Groq) si window.API_BASE_URL está definido
 *            2) window.aiService (Claude) como fallback
 * Sin localStorage; estado solo en memoria.
 */
(function () {
  'use strict';

  var WELCOME_MESSAGE = {
    role: 'assistant',
    content: '¡Hola! 👋 Soy tu mentor de programación (Groq AI).\n\n¿En qué puedo ayudarte hoy? Puedo:\n\n• Resolver dudas sobre tu plan de carrera\n• Explicar conceptos técnicos\n• Revisar tu código\n• Sugerir recursos de aprendizaje\n• Motivarte en tu proceso 💪'
  };

  var QUICK_QUESTIONS = [
    '¿Cómo va mi progreso?',
    'Dame un consejo para hoy',
    'Explícame un concepto de mi fase actual',
    '¿Qué proyecto debo hacer ahora?'
  ];

  var state = {
    messages: [],
    loading: false,
    isMinimized: false
  };

  function getRoot() {
    return document.getElementById('chatbotSidebarRoot');
  }

  function getOverlay() { return document.getElementById('chatbotOverlay'); }
  function getSidebar() { return document.getElementById('chatbotSidebar'); }
  function getSidebarBody() { return document.getElementById('chatbotSidebarBody'); }
  function getMinimizedView() { return document.getElementById('chatbotMinimizedView'); }
  function getMessagesEl() { return document.getElementById('chatbotMessages'); }
  function getQuickQuestions() { return document.getElementById('chatbotQuickQuestions'); }
  function getTypingEl() { return document.getElementById('chatbotTyping'); }
  function getInput() { return document.getElementById('chatbotInput'); }
  function getFloatBtn() { return document.getElementById('chatbotFloatBtn'); }

  function isOpen() {
    var sidebar = getSidebar();
    return sidebar && sidebar.getAttribute('aria-hidden') === 'false';
  }

  function openSidebar() {
    var overlay = getOverlay();
    var sidebar = getSidebar();
    var floatBtn = getFloatBtn();
    if (!overlay || !sidebar) return;
    overlay.setAttribute('aria-hidden', 'false');
    overlay.classList.add('show');
    sidebar.setAttribute('aria-hidden', 'false');
    sidebar.classList.add('show');
    if (floatBtn) floatBtn.classList.add('chatbot-float-btn-hidden');
    setTimeout(function () {
      var input = getInput();
      if (input) {
        input.focus();
      }
    }, 320);
  }

  function closeSidebar() {
    var overlay = getOverlay();
    var sidebar = getSidebar();
    var floatBtn = getFloatBtn();
    if (!overlay || !sidebar) return;
    overlay.setAttribute('aria-hidden', 'true');
    overlay.classList.remove('show');
    sidebar.setAttribute('aria-hidden', 'true');
    sidebar.classList.remove('show');
    if (floatBtn) floatBtn.classList.remove('chatbot-float-btn-hidden');
  }

  function setMinimized(minimized) {
    state.isMinimized = minimized;
    var body = getSidebarBody();
    var minView = getMinimizedView();
    if (!body || !minView) return;
    if (minimized) {
      body.style.display = 'none';
      minView.style.display = 'flex';
    } else {
      body.style.display = 'flex';
      minView.style.display = 'none';
    }
  }

  function escapeHtml(text) {
    if (text == null) return '';
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function nl2br(text) {
    return escapeHtml(text || '').replace(/\n/g, '<br>');
  }

  function renderMessages() {
    var container = getMessagesEl();
    if (!container) return;
    var welcome = container.querySelector('.chatbot-msg-assistant[data-role="assistant"]');
    var firstContent = welcome ? welcome.querySelector('.chatbot-msg-content') : null;
    container.innerHTML = '';

    if (state.messages.length === 0) {
      var welcomeDiv = document.createElement('div');
      welcomeDiv.className = 'chatbot-msg chatbot-msg-assistant';
      welcomeDiv.setAttribute('data-role', 'assistant');
      welcomeDiv.innerHTML = '<div class="chatbot-msg-content"><p>' + nl2br(WELCOME_MESSAGE.content) + '</p></div>';
      container.appendChild(welcomeDiv);
    } else {
      state.messages.forEach(function (msg) {
        var div = document.createElement('div');
        div.className = 'chatbot-msg chatbot-msg-' + msg.role;
        div.setAttribute('data-role', msg.role);
        var content = msg.role === 'user' ? escapeHtml(msg.content) : nl2br(msg.content);
        div.innerHTML = '<div class="chatbot-msg-content">' + (msg.role === 'user' ? '<p>' + content + '</p>' : content) + '</div>';
        container.appendChild(div);
      });
    }

    container.scrollTop = container.scrollHeight;
    updateQuickQuestionsVisibility();
  }

  function updateQuickQuestionsVisibility() {
    var qq = getQuickQuestions();
    if (!qq) return;
    var count = state.messages.length;
    if (count === 0) {
      qq.style.display = 'flex';
    } else {
      qq.style.display = 'none';
    }
  }

  function addMessage(role, content) {
    state.messages.push({ role: role, content: content });
    renderMessages();
  }

  function setLoading(loading) {
    state.loading = loading;
    var typing = getTypingEl();
    if (typing) typing.style.display = loading ? 'flex' : 'none';
    if (loading) {
      var messages = getMessagesEl();
      if (messages) messages.scrollTop = messages.scrollHeight;
    }
  }

  function sendMessage(text) {
    var message = (text || '').trim();
    if (!message || state.loading) return;

    addMessage('user', message);
    setLoading(true);

    function done(responseText) {
      addMessage('assistant', responseText);
      setLoading(false);
      var messages = getMessagesEl();
      if (messages) messages.scrollTop = messages.scrollHeight;
    }

    function fail(errMsg) {
      addMessage('assistant', errMsg || 'No pude procesar tu mensaje. Inténtalo de nuevo.');
      setLoading(false);
      var messages = getMessagesEl();
      if (messages) messages.scrollTop = messages.scrollHeight;
    }

    var apiBase = typeof window.API_BASE_URL !== 'undefined' ? window.API_BASE_URL : '';

    if (apiBase) {
      fetch(apiBase + '/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message })
      })
        .then(function (res) {
          if (!res.ok) {
            return res.json().then(function (data) {
              throw new Error(data.detail || 'Error en el servidor');
            }).catch(function () {
              throw new Error('Error ' + res.status);
            });
          }
          return res.json();
        })
        .then(function (data) {
          done(data.message || 'Sin respuesta');
        })
        .catch(function (err) {
          console.error('Chatbot sidebar (backend):', err);
          fail(err && err.message ? err.message : 'No se pudo conectar con el servidor. ¿Está corriendo el backend en ' + apiBase + '?');
        });
      return;
    }

    var user = typeof auth !== 'undefined' && auth && auth.getUser ? auth.getUser() : null;
    var contextInfo = user && user.plan ? {
      currentPhase: user.plan.phases && user.plan.phases.find(function (p) {
        return user.progress && !user.progress.completedPhases.includes(p.id);
      }),
      completedProjects: user.progress && user.progress.completedProjects ? user.progress.completedProjects.length : 0,
      goal: user.plan.description
    } : {};
    var fullPrompt = message;
    if (contextInfo && (contextInfo.currentPhase || contextInfo.completedProjects !== undefined)) {
      fullPrompt = 'Contexto del usuario (plan de carrera): ' + JSON.stringify(contextInfo) + '\n\nPregunta del usuario: ' + message;
    }

    if (typeof window.aiService !== 'undefined' && window.aiService && window.aiService.isConfigured) {
      window.aiService.callClaude(fullPrompt)
        .then(function (response) {
          done(typeof response === 'string' ? response : (response && response.message ? response.message : 'Sin respuesta'));
        })
        .catch(function (err) {
          console.error('Chatbot sidebar:', err);
          fail(err && err.message ? err.message : 'Error conectando con Groq en backend. Verifica API_BASE_URL.');
        });
    } else {
      fail('Configura window.API_BASE_URL (ej: http://127.0.0.1:8000) para usar el backend Groq.');
    }
  }

  function initChatbotSidebar() {
    var root = getRoot();
    if (!root) return;

    state.messages = [];
    renderMessages();

    getFloatBtn().addEventListener('click', function () {
      openSidebar();
    });

    getOverlay().addEventListener('click', function () {
      closeSidebar();
    });

    document.getElementById('chatbotBtnClose').addEventListener('click', function () {
      closeSidebar();
    });

    document.getElementById('chatbotBtnMinimize').addEventListener('click', function () {
      setMinimized(true);
    });

    document.getElementById('chatbotBtnMaximize').addEventListener('click', function () {
      setMinimized(false);
    });

    document.getElementById('chatbotSendBtn').addEventListener('click', function () {
      var input = getInput();
      if (input) {
        sendMessage(input.value);
        input.value = '';
      }
    });

    var input = getInput();
    if (input) {
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          sendMessage(input.value);
          input.value = '';
        }
      });
    }

    root.querySelectorAll('.chatbot-quick-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var q = this.getAttribute('data-question');
        if (q) sendMessage(q);
      });
    });
  }

  window.initChatbotSidebar = initChatbotSidebar;
})();
