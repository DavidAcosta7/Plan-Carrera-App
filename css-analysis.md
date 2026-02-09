# INSPECCIÓN CSS - LOGIN PAGE

## 📁 ARCHIVOS CSS CARGADOS (en orden)

1. **styles.css** (línea 7) - Sistema de diseño global
2. **login.css** (línea 8) - Estilos específicos del login
3. **<style> inline** (línea 9+) - Estilos inline con mayor prioridad

## 🎯 ANÁLISIS DE SELECTORES GANADORES

### BODY
- **Ganador**: `<style> inline` (línea 17-28)
- **Selector**: `body`
- **Reglas aplicadas**:
  ```css
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: var(--bg-page-gradient);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    margin: 0;
    padding: 0;
    position: relative;
  }
  ```
- **Conflictos**: 
  - `styles.css` línea 143: aplica `font-family: var(--font-family-sans)` y `display: block` ❌
  - `login.css` línea 5: aplica `display: flex` ✅ (pero es sobrescrito por inline)

### LOGIN/AUTH WRAPPER
- **Ganador**: `<style> inline` (línea 75-86)
- **Selector**: `.login-container`
- **Reglas aplicadas**:
  ```css
  .login-container {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-8) var(--spacing-6);
    position: relative;
    z-index: 5;
    order: 2;
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
  }
  ```
- **Conflictos**:
  - `login.css` línea 75: aplica `max-width: 400px` ❌ (limita el centrado)
  - `styles.css` línea 1383: `.login-box, .auth-card` aplica estilos diferentes ❌

### BUTTON
- **Ganador**: `<style> inline` (estilos definidos inline)
- **Selector**: `.btn`
- **Reglas aplicadas**:
  ```css
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px 24px;
    /* ... más reglas inline */
  }
  ```
- **Conflictos**:
  - `styles.css` línea 266: `button.btn` aplica `-webkit-appearance: none` ✅
  - `styles.css` línea 234: `.btn` base styles ❌ (sobrescrito por inline)
  - `login.css` línea 194: `.login-page .btn-primary` aplica `min-height: 48px` ❌

### INPUT
- **Ganador**: `<style> inline` (estilos definidos inline)
- **Selector**: `.input`
- **Reglas aplicadas**:
  ```css
  .input {
    width: 100%;
    padding: 10px 14px;
    border: 1px solid #d1d5db;
    border-radius: var(--radius-input);
    /* ... más reglas inline */
  }
  ```
- **Conflictos**:
  - `styles.css` línea 434: `.input` base styles ❌ (sobrescrito por inline)
  - `login.css` línea 168: `.login-page .input` aplica estilos similares ❌

## ⚠️ PROBLEMAS IDENTIFICADOS

### 1. CONFLICTO DE DISPLAY EN BODY
- **styles.css**: `display: block` (línea 143 implícito)
- **login.css**: `display: flex` (línea 8)
- **inline**: `display: flex` ✅ (gana)

### 2. CONFLICTO DE ANCHO EN CONTENEDOR
- **login.css**: `max-width: 400px` (línea 77) ❌
- **inline**: `max-width: 1200px` ✅ (gana)

### 3. MÚLTIPLES DEFINICIONES DE CARD
- **styles.css**: `.login-box, .auth-card` (línea 1383)
- **login.css**: `.login-page .auth-card` (línea 124)
- **inline**: `.floating-card` ✅ (diferente selector)

### 4. ESPECIFICIDAD PROBLEMÁTICA
- **styles.css**: menor especificidad pero carga primero
- **login.css**: mayor especificidad con `.login-page` pero carga segundo
- **inline**: máxima prioridad, gana siempre

## 🔧 SOLUCIÓN RECOMENDADA

El problema principal es que **login.css está limitando el ancho del contenedor a 400px** (línea 77), lo que impide el centrado proper.

**Archivo problemático**: `login.css` línea 77
```css
max-width: 400px;  /* ❌ Esto impide el centrado */
```

**Debería ser**:
```css
max-width: 1200px;  /* ✅ Como el landing */
```

O eliminar la regla para que el inline style gane completamente.
