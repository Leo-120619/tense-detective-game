const assert = require("assert");
const fs = require("fs");
const vm = require("vm");

class FakeElement {
  constructor(id = "") {
    this.id = id;
    this.dataset = {};
    this.disabled = false;
    this.innerHTML = "";
    this.textContent = "";
    this.className = "";
    this.children = [];
    this.listeners = {};
    this.style = {};
    this.classList = {
      add: () => {},
      remove: () => {},
      toggle: () => {}
    };
  }

  append(child) {
    this.children.push(child);
  }

  addEventListener(event, callback) {
    this.listeners[event] = callback;
  }

  click() {
    if (this.listeners.click) {
      this.listeners.click();
    }
  }

  setAttribute() {}
  removeAttribute() {}
}

function createDocument() {
  const elements = new Map();
  return {
    getElementById(id) {
      if (!elements.has(id)) {
        elements.set(id, new FakeElement(id));
      }
      return elements.get(id);
    },
    createElement() {
      return new FakeElement();
    },
    querySelectorAll() {
      return [];
    },
    querySelector() {
      return new FakeElement();
    }
  };
}

function completeCurrentLogoQuizRound(context) {
  const answer = context.state.logoQuizAnswer;
  answer.split('').forEach(letter => {
    const poolItem = context.state.logoQuizPool.find(p => p.letter === letter && !p.used);
    context.selectLetterFromPool(poolItem);
  });
}

const html = fs.readFileSync("index.html", "utf8");
const script = html.match(/<script>([\s\S]*)<\/script>/)[1];
const context = {
  assert,
  completeCurrentLogoQuizRound,
  console,
  document: createDocument(),
  window: {
    setTimeout(callback) {
      callback();
    }
  }
};

vm.createContext(context);
vm.runInContext(`${script}

state.level = 2;
state.learned = new Set(getActiveVerbs().map(verb => verb.base));
startMemory();

// Level 2 has 16 verbs. We complete all 16 rounds.
for (let i = 0; i < 16; i++) {
  assert.strictEqual(state.screen, "memory");
  assert.ok(state.logoQuizAnswer);
  completeCurrentLogoQuizRound({ state, selectLetterFromPool });
}

assert.strictEqual(els.toUse.disabled, false);
assert.strictEqual(els.toUse.textContent, "Use the Verbs");

els.toUse.click();
assert.strictEqual(state.screen, "use");
assert.strictEqual(state.questions.length, 16);
`, context);
