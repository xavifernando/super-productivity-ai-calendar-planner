const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const script = html.match(/<script>\s*([\s\S]*?)<\/script>/)?.[1];

if (!script) {
  throw new Error('Could not find the plugin inline script');
}

function createElement() {
  return {
    children: [],
    className: '',
    disabled: false,
    dataset: {},
    style: {},
    value: '',
    _innerHTML: '',
    set innerHTML(value) {
      this._innerHTML = value;
      this.children = [];
    },
    get innerHTML() {
      return this._innerHTML;
    },
    appendChild(child) {
      this.children.push(child);
      return child;
    },
    addEventListener() {},
    setAttribute() {},
    getAttribute() {
      return null;
    },
  };
}

function loadPlugin({
  now,
  pluginApi = {},
  fetch,
  confirm = () => false,
  querySelector = () => null,
  querySelectorAll = () => [],
} = {}) {
  const elements = new Map();
  const domReadyListeners = [];
  const hooks = new Map();
  const notifications = [];
  const alerts = [];
  const storage = new Map();
  const FixedDate = now
    ? class extends Date {
        constructor(...args) {
          super(...(args.length ? args : [now]));
        }
        static now() {
          return new Date(now).getTime();
        }
      }
    : Date;
  const api = {
    showSnack(notification) {
      notifications.push(notification);
    },
    registerHook(name, callback) {
      hooks.set(name, callback);
    },
    ...pluginApi,
  };
  const document = {
    body: { setAttribute() {} },
    getElementById(id) {
      return elements.get(id) ?? null;
    },
    createElement,
    querySelector,
    querySelectorAll,
    addEventListener(name, callback) {
      if (name === 'DOMContentLoaded') domReadyListeners.push(callback);
    },
  };
  const context = {
    URL,
    Date: FixedDate,
    Math,
    Set,
    Map,
    Promise,
    console,
    document,
    window: {
      PluginAPI: api,
      addEventListener(name, callback) {
        if (name === 'DOMContentLoaded') domReadyListeners.push(callback);
      },
    },
    PluginAPI: api,
    localStorage: {
      getItem(key) {
        return storage.get(key) ?? null;
      },
      setItem(key, value) {
        storage.set(key, value);
      },
      removeItem(key) {
        storage.delete(key);
      },
    },
    fetch: fetch ?? (async () => {
      throw new Error('Unexpected fetch in rendering test');
    }),
    setTimeout,
    confirm,
    alert(message) {
      alerts.push(message);
    },
  };
  vm.createContext(context);
  vm.runInContext(script, context);
  return {
    context,
    elements,
    api,
    hooks,
    domReadyListeners,
    notifications,
    alerts,
    storage,
  };
}

test('escapeHtml encodes HTML text and attribute metacharacters', () => {
  const { context } = loadPlugin();

  assert.equal(
    context.escapeHtml("&<>\"'"),
    '&amp;&lt;&gt;&quot;&#39;',
  );
});

test('calendar, app, habit, and model text render as inert content', () => {
  const { context, elements } = loadPlugin({
    now: new Date(2026, 7, 27, 8).getTime(),
  });
  for (const id of [
    'timelineListContainer',
    'projectsAccordionContainer',
    'habitCategoriesAccordion',
    'stagedItemsContainer',
    'projectedScheduleContainer',
    'emptyTasksState',
  ]) {
    elements.set(id, createElement());
  }

  vm.runInContext(
    `todayEvents = [{
      summary: '<img src=x onerror=alert(1)> Calendar & title',
      source: 'Calendar',
      startTime: new Date(2026, 7, 27, 9),
      endTime: new Date(2026, 7, 27, 10),
      startFormatted: '09:00',
      endFormatted: '10:00'
    }];
    projectsList = [{ id: 'project-id', title: 'Project <name> & title' }];
    allTasks = [{ id: 'task-id', title: 'Imported <task> & title', projectId: 'project-id', timeEstimate: 1800000 }];
    projectTaskMap = { 'project-id': allTasks };
    projectTaskSelectionMap = {};
    userHabitCategories = [{
      id: 'category-id',
      name: 'Category <name>',
      desc: 'Description & details',
      habits: [{ id: 'habit-id', title: 'Habit <title> & details', freq: 'Daily', dur: 15, enabled: true }]
    }];
    calculateStatsAndTimeline();
    renderProjectsExplorer();
    renderHabitsAccordion();
    renderStagedItems([{
      title: 'Model <title> & details" onfocus="alert(1)',
      projectName: 'Model <project>',
      rationale: 'Model <rationale> & details',
      startTime: '09:00',
      endTime: '10:00',
      timeEstimateMinutes: 60,
      priority: 'HIGH'
    }], 'Model <summary> & details', false);`,
    context,
  );

  const timelineHtml =
    elements.get('timelineListContainer').children[0].innerHTML;
  const projectHtml =
    elements.get('projectsAccordionContainer').children[0].innerHTML;
  const habitHtml =
    elements.get('habitCategoriesAccordion').children[0].innerHTML;
  const stagedHtml = elements.get('stagedItemsContainer').children[0].innerHTML;
  const projectedHtml =
    elements.get('projectedScheduleContainer').children[0].innerHTML;

  assert.match(timelineHtml, /&lt;img src=x onerror=alert\(1\)&gt; Calendar &amp; title/);
  assert.doesNotMatch(timelineHtml, /<img/i);
  assert.match(projectHtml, /Project &lt;name&gt; &amp; title/);
  assert.match(projectHtml, /Imported &lt;task&gt; &amp; title/);
  assert.doesNotMatch(projectHtml, /onclick="[^"]*Imported/);
  assert.match(habitHtml, /Habit &lt;title&gt; &amp; details/);
  assert.doesNotMatch(habitHtml, /onclick="[^"]*Habit/);
  assert.match(stagedHtml, /Model &lt;title&gt; &amp; details&quot; onfocus=&quot;alert\(1\)/);
  assert.doesNotMatch(stagedHtml, /onfocus="alert\(1\)"/);
  assert.match(stagedHtml, /Model &lt;rationale&gt; &amp; details/);
  assert.match(projectedHtml, /Model &lt;title&gt; &amp; details/);
});

test('local date keys and scheduled-task matching use the selected local day', () => {
  const { context } = loadPlugin({ now: '2026-08-27T20:00:00-07:00' });
  assert.equal(
    context.toLocalDateKey(new Date(2026, 7, 27, 20)),
    '2026-08-27',
  );
  assert.equal(
    context.isTaskScheduledForDate(
      { dueWithTime: new Date(2026, 7, 27, 10).getTime() },
      '2026-08-27',
    ),
    true,
  );
  assert.equal(
    context.isTaskScheduledForDate(
      { dueWithTime: new Date(2026, 8, 12, 10).getTime() },
      '2026-08-27',
    ),
    false,
  );
  assert.equal(
    context.isTaskScheduledForDate(
      {
        dueDay: '2026-08-27',
        dueWithTime: new Date(2026, 8, 12, 10).getTime(),
      },
      '2026-08-27',
    ),
    false,
  );
});

test('same-time events on different dates are not deduplicated', () => {
  const { context, elements } = loadPlugin();
  elements.set('timelineListContainer', createElement());
  vm.runInContext(
    `deduplicateAndSetEvents([
      {summary: 'Meeting', startTime: new Date(2026, 7, 27, 9), endTime: new Date(2026, 7, 27, 10)},
      {summary: 'Meeting', startTime: new Date(2026, 7, 28, 9), endTime: new Date(2026, 7, 28, 10)}
    ])`,
    context,
  );
  assert.equal(vm.runInContext('todayEvents.length', context), 2);
});

test('events scheduled for another date do not reduce today free time', () => {
  const { context, elements } = loadPlugin({
    now: new Date(2026, 7, 27, 8).getTime(),
  });
  const start = createElement();
  start.value = '09:00';
  const end = createElement();
  end.value = '18:00';
  elements.set('workdayStart', start);
  elements.set('workdayEnd', end);
  vm.runInContext(
    `todayEvents=[{
      summary:"Future task",
      startTime:new Date(2026, 8, 12, 10),
      endTime:new Date(2026, 8, 12, 11)
    }]`,
    context,
  );
  const slots = JSON.parse(JSON.stringify(context.calculateFreeTimeSlots()));
  assert.equal(slots.length, 1);
  assert.equal(slots[0].durationMin, 540);
});

test('empty app data produces no demonstration projects, tasks, or meetings', async () => {
  const { context } = loadPlugin({
    pluginApi: {
      getAllProjects: async () => [],
      getTasks: async () => [],
    },
  });
  await context.scanSuperProductivityData();
  assert.equal(vm.runInContext('projectsList.length', context), 0);
  assert.equal(vm.runInContext('allTasks.length', context), 0);
  assert.equal(vm.runInContext('todayEvents.length', context), 0);
});

test('scheduled tasks on other dates are not treated as backlog', () => {
  const { context } = loadPlugin();
  vm.runInContext(
    `allTasks=[
      {id:"backlog"},
      {id:"future-day",dueDay:"2026-09-12"},
      {id:"future-time",dueWithTime:new Date(2026,8,12,10).getTime()}
    ]`,
    context,
  );
  const ids = JSON.parse(
    JSON.stringify(context.getUnscheduledBacklogTasks().map((task) => task.id)),
  );
  assert.deepEqual(ids, ['backlog']);
});

test('obsolete plannedAt data is not treated as an app schedule', () => {
  const { context } = loadPlugin({
    now: new Date(2026, 7, 27, 8).getTime(),
  });
  vm.runInContext(
    `allTasks=[{id:"legacy",plannedAt:new Date(2026,7,27,10).getTime()}]`,
    context,
  );
  assert.equal(context.isTaskScheduledForDate(
    { plannedAt: new Date(2026, 7, 27, 10).getTime() },
    '2026-08-27',
  ), false);
  assert.deepEqual(
    JSON.parse(JSON.stringify(context.getUnscheduledBacklogTasks().map((task) => task.id))),
    ['legacy'],
  );
});

test('iCal ingestion preserves an event date instead of moving it to the selected date', () => {
  const { context } = loadPlugin({
    now: new Date(2026, 7, 27, 8).getTime(),
  });
  const imported = context.parseICSContent(
    'BEGIN:VCALENDAR\nBEGIN:VEVENT\nSUMMARY:Future meeting\nDTSTART:20260912T100000\nDTEND:20260912T110000\nEND:VEVENT\nEND:VCALENDAR',
  );
  assert.equal(imported[0].startTime.getFullYear(), 2026);
  assert.equal(imported[0].startTime.getMonth(), 8);
  assert.equal(imported[0].startTime.getDate(), 12);
});

test('planner input includes backlog tasks without a project', () => {
  const { context } = loadPlugin();
  const prompt = context.buildPlannerInput(
    [{ id: 'inbox-task', title: 'Unassigned review task', timeEstimate: 1800000 }],
    [{ id: 'project', title: 'Project' }],
  );
  assert.match(prompt, /Unassigned review task/);
  assert.match(prompt, /\[inbox-task\]/);
});

test('AI items matching one existing task by title are rescheduled rather than created', () => {
  const { context } = loadPlugin();
  const plan = context.normalizePlanItems(
    [
      { title: '  Existing   task ', startTime: '10:00', endTime: '10:30' },
      { title: 'Local custom task', originalTaskId: 'custom-id' },
      { title: 'A new task', startTime: '11:00', endTime: '11:30' },
    ],
    [
      { id: 'existing-id', title: 'Existing task' },
      { id: 'custom-id', title: 'Local custom task' },
    ],
    new Set(['existing-id']),
  );
  assert.equal(plan.length, 3);
  assert.equal(plan[0].originalTaskId, 'existing-id');
  assert.equal(plan[0].actionType, 'SCHEDULE_EXISTING');
  assert.equal(plan[1].originalTaskId, undefined);
  assert.equal(plan[1].localTaskId, 'custom-id');
  assert.equal(plan[2].originalTaskId, undefined);
});

test('AI items ambiguously matching duplicate task titles are not created', () => {
  const { context } = loadPlugin();
  const plan = context.normalizePlanItems(
    [{ title: 'Same title' }],
    [
      { id: 'first', title: 'Same title' },
      { id: 'second', title: 'Same title' },
    ],
    new Set(['first', 'second']),
  );
  assert.equal(plan.length, 0);
});

test('simulation uses each existing task once and leaves extra time open', () => {
  const { context } = loadPlugin();
  vm.runInContext(`appTaskIds=new Set(["one"])`, context);
  const result = JSON.parse(
    JSON.stringify(
      context.buildSimulatedPlan(
        [{ id: 'one', title: 'One', timeEstimate: 3600000 }],
        [{ startMin: 540, endMin: 720, durationMin: 180 }],
        60,
      ),
    ),
  );
  assert.equal(result.recommendedTasks.length, 1);
  assert.equal(result.recommendedTasks[0].originalTaskId, 'one');
  assert.equal(result.recommendedTasks[0].actionType, 'SCHEDULE_EXISTING');
  assert.doesNotMatch(JSON.stringify(result), /Implement core pipeline|Sprint|Focus block/);
});

test('local custom tasks are created without local-only project IDs', async () => {
  const creates = [];
  const updates = [];
  const { context, elements, storage } = loadPlugin({
    now: new Date(2026, 7, 27, 8).getTime(),
    pluginApi: {
      getAllProjects: async () => [],
      getTasks: async () => [],
      addTask: async (payload) => {
        creates.push(payload);
        return 'app-task-id';
      },
      updateTask: async (...args) => updates.push(args),
    },
    querySelector: (selector) => {
      if (selector.includes('task-title-input')) return { value: 'Custom task' };
      if (selector.includes('task-start-time')) return { value: '10:00' };
      if (selector.includes('task-end-time')) return { value: '10:45' };
      if (selector.includes('task-est-input')) return { value: '45' };
      return null;
    },
    querySelectorAll: (selector) =>
      selector === '.task-checkbox:checked'
        ? [{ getAttribute: () => '0' }]
        : [],
  });
  elements.set('btnApplyTasksToToday', createElement());
  vm.runInContext(
    `customProjects=[{id:"cp_local",title:"Local project"}];
     customTasks=[{id:"ct_local",title:"Custom task",projectId:"cp_local",timeEstimate:2700000}];
     projectsList=[...customProjects];
     allTasks=[...customTasks];
     stagedItems=[{title:"Custom task",localTaskId:"ct_local",projectId:"cp_local",projectName:"Local project",timeEstimateMinutes:45,startTime:"10:00",endTime:"10:45"}]`,
    context,
  );
  await context.applySelectedTasksOnly();
  assert.equal(creates.length, 1);
  assert.equal(creates[0].projectId, undefined);
  assert.equal(creates[0].dueWithTime, undefined);
  assert.equal(vm.runInContext('customTasks.length', context), 0);
  assert.deepEqual(JSON.parse(storage.get('sp_ai_custom_proj_v4')).tasks, []);
  assert.deepEqual(JSON.parse(JSON.stringify(updates[0])), [
    'app-task-id',
    { dueWithTime: new Date(2026, 7, 27, 10).getTime(), dueDay: null, timeEstimate: 2700000 },
  ]);
});

test('new task creation uses addTask dueDay then updateTask for timed scheduling', async () => {
  const creates = [];
  const updates = [];
  const { context, elements } = loadPlugin({
    now: new Date(2026, 7, 27, 8).getTime(),
    pluginApi: {
      addTask: async (payload) => {
        creates.push(payload);
        return 'new-task-id';
      },
      updateTask: async (...args) => updates.push(args),
    },
    querySelector: (selector) => {
      if (selector.includes('task-title-input')) return { value: 'New task' };
      if (selector.includes('task-start-time')) return { value: '11:00' };
      if (selector.includes('task-end-time')) return { value: '11:30' };
      if (selector.includes('task-est-input')) return { value: '30' };
      return null;
    },
    querySelectorAll: (selector) =>
      selector === '.task-checkbox:checked'
        ? [{ getAttribute: () => '0' }]
        : [],
  });
  elements.set('btnApplyTasksToToday', createElement());
  vm.runInContext(
    `projectsList=[];allTasks=[];stagedItems=[{title:"New task",timeEstimateMinutes:30,startTime:"11:00",endTime:"11:30"}]`,
    context,
  );
  await context.applySelectedTasksOnly();
  assert.equal(creates.length, 1);
  assert.equal(creates[0].dueDay, '2026-08-27');
  assert.equal(creates[0].dueWithTime, undefined);
  assert.deepEqual(JSON.parse(JSON.stringify(updates[0])), [
    'new-task-id',
    {
      dueWithTime: new Date(2026, 7, 27, 11).getTime(),
      dueDay: null,
      timeEstimate: 1800000,
    },
  ]);
});

test('habit sync preserves existing counts and initializes missing counters only', async () => {
  const setCounterCalls = [];
  const { context, notifications } = loadPlugin({
    pluginApi: {
      getCounter: async (id) => (id === 'habit-morning' ? 3 : null),
      setCounter: async (...args) => setCounterCalls.push(args),
    },
  });
  assert.equal(context.getHabitCounterId('Morning'), 'habit-morning');
  assert.notEqual(context.getHabitCounterId('🧘'), 'habit-');
  assert.notEqual(context.getHabitCounterId('🧘'), context.getHabitCounterId('🌱'));
  assert.equal(await context.syncHabitToSuperProductivity('Morning'), true);
  assert.equal(await context.syncHabitToSuperProductivity('Evening'), true);
  assert.deepEqual(setCounterCalls, [['habit-evening', 0]]);
  assert.equal(notifications.filter((n) => n.type === 'SUCCESS').length, 2);
});

test('habit sync reports API failures instead of success', async () => {
  const { context, notifications } = loadPlugin({
    pluginApi: {
      getCounter: async () => {
        throw new Error('API unavailable');
      },
    },
  });
  assert.equal(await context.syncHabitToSuperProductivity('Morning'), false);
  assert.equal(notifications.at(-1).type, 'ERROR');
});

test('date cleanup confirms the matching count and only unschedules matching tasks', async () => {
  const updates = [];
  const confirms = [];
  const today = new Date(2026, 7, 27, 12).getTime();
  const { context, notifications } = loadPlugin({
    now: new Date(2026, 7, 27, 12).getTime(),
    confirm: (message) => {
      confirms.push(message);
      return true;
    },
    pluginApi: {
      getTasks: async () => [
        { id: 'today', title: 'Keep content', projectId: 'p1', dueDay: '2026-08-27', notes: 'keep' },
        { id: 'timed', dueWithTime: today, timeEstimate: 60000 },
        { id: 'tomorrow', dueDay: '2026-08-28' },
        { id: 'done', dueDay: '2026-08-27', isDone: true },
      ],
      updateTask: async (...args) => updates.push(args),
      deleteTask: async () => assert.fail('cleanup must not delete tasks'),
    },
  });
  await context.cleanCurrentDateTasks();
  assert.match(confirms[0], /2 tasks/);
  assert.equal(updates.length, 2);
  assert.deepEqual(JSON.parse(JSON.stringify(updates[0])), [
    'today',
    { dueDay: null, dueWithTime: null },
  ]);
  assert.equal(notifications.at(-1).type, 'SUCCESS');
});

test('undo restores schedules without deleting or completing tasks', async () => {
  const updates = [];
  const { context } = loadPlugin({
    confirm: () => true,
    pluginApi: {
      updateTask: async (...args) => updates.push(args),
      deleteTask: async () => assert.fail('undo must not delete tasks'),
    },
  });
  vm.runInContext(
    `lastAppliedTasks=[{id:"existing-id",previous:{dueDay:"2026-08-27",dueWithTime:null}}]`,
    context,
  );
  await context.undoLastAppliedTasks();
  assert.deepEqual(JSON.parse(JSON.stringify(updates)), [
    ['existing-id', { dueDay: '2026-08-27', dueWithTime: null }],
  ]);
});

test('existing staged tasks are updated once without creation or obsolete fields', async () => {
  const updates = [];
  const creates = [];
  const originalTask = {
    id: 'existing-id',
    title: 'Existing task',
    timeEstimate: 1800000,
  };
  const input = {
    value: '10:00',
  };
  const estimateInput = { value: '45' };
  const titleInput = { value: 'Existing task' };
  const checkbox = { getAttribute: () => '0' };
  const { context, elements, alerts } = loadPlugin({
    now: new Date(2026, 7, 27, 8).getTime(),
    confirm: () => true,
    pluginApi: {
      updateTask: async (...args) => updates.push(args),
      addTask: async (...args) => {
        creates.push(args);
        return 'new-id';
      },
      getTasks: async () => [originalTask],
      getAllProjects: async () => [],
    },
    querySelector: (selector) => {
      if (selector.includes('task-title-input')) return titleInput;
      if (selector.includes('task-start-time')) return input;
      if (selector.includes('task-end-time')) return { value: '10:45' };
      if (selector.includes('task-est-input')) return estimateInput;
      return null;
    },
    querySelectorAll: (selector) =>
      selector === '.task-checkbox:checked' ? [checkbox] : [],
  });
  elements.set('btnApplyTasksToToday', createElement());
  vm.runInContext(
    `appTaskIds=new Set(["existing-id"]);
     appProjectIds=new Set(["project-id"]);
     allTasks=[${JSON.stringify(originalTask)}];
     projectsList=[{id:"project-id",title:"Project"}];
     manuallyAddProjectTaskToToday("project-id","Existing task",45,"existing-id")`,
    context,
  );
  assert.equal(vm.runInContext('stagedItems[0].actionType', context), 'SCHEDULE_EXISTING');
  assert.equal(context.document.querySelectorAll('.task-checkbox:checked').length, 1);
  await context.applySelectedTasksOnly();
  assert.deepEqual(alerts, []);
  assert.equal(updates.length, 1);
  assert.deepEqual(JSON.parse(JSON.stringify(updates[0])), [
    'existing-id',
    { dueWithTime: new Date(2026, 7, 27, 10).getTime(), dueDay: null, timeEstimate: 2700000 },
  ]);
  assert.equal(creates.length, 0);
  await context.undoLastAppliedTasks();
  assert.deepEqual(JSON.parse(JSON.stringify(updates[1])), [
    'existing-id',
    { dueDay: null, dueWithTime: null, timeEstimate: 1800000 },
  ]);
});

test('finishDay does nothing unless the opt-in setting is enabled', async () => {
  const { context, api, hooks, domReadyListeners } = loadPlugin();
  domReadyListeners.forEach((listener) => listener());
  let taskReads = 0;
  api.getTasks = async () => {
    taskReads++;
    return [];
  };
  await hooks.get('finishDay')();
  assert.equal(taskReads, 0);
  assert.equal(vm.runInContext('config.autoDraftOnFinishDay', context), false);
});

test('fixed cloud provider requests use PluginAPI.request; custom endpoints use fetch', async () => {
  const bridgeRequests = [];
  const directRequests = [];
  const response = {
    ok: true,
    status: 200,
    json: async () => ({ choices: [{ message: { content: '{"ok":true}' } }] }),
  };
  const { context } = loadPlugin({
    pluginApi: {
      request: async (...args) => {
        bridgeRequests.push(args);
        return response;
      },
    },
    fetch: async (...args) => {
      directRequests.push(args);
      return response;
    },
  });
  vm.runInContext(
    `config.provider="openai";config.endpoint="https://api.openai.com/v1/chat/completions";config.apiKey="test";config.model="gpt-4o"`,
    context,
  );
  await context.executeAIPrompt('hello', 'system');
  assert.equal(bridgeRequests.length, 1);
  assert.equal(directRequests.length, 0);

  vm.runInContext(
    `config.provider="custom";config.endpoint="https://custom.example/v1/chat/completions"`,
    context,
  );
  await context.executeAIPrompt('hello', 'system');
  assert.equal(bridgeRequests.length, 1);
  assert.equal(directRequests.length, 1);

  vm.runInContext(
    `config.provider="ollama";config.endpoint="http://localhost:11434/v1/chat/completions"`,
    context,
  );
  await context.executeAIPrompt('hello', 'system');
  assert.equal(bridgeRequests.length, 1);
  assert.equal(directRequests.length, 2);
});

test('fixed cloud providers do not fall back to unrestricted fetch without the bridge API', async () => {
  const directRequests = [];
  const { context } = loadPlugin({
    fetch: async (...args) => {
      directRequests.push(args);
      throw new Error('Should not make a direct request');
    },
  });
  vm.runInContext(
    `config.provider="openai";config.endpoint="https://api.openai.com/v1/chat/completions";config.apiKey="test"`,
    context,
  );
  await assert.rejects(
    context.executeAIPrompt('hello', 'system'),
    /allowlisted HTTP request API is unavailable/,
  );
  assert.equal(directRequests.length, 0);
});

test('calendar feed requests use direct fetch', async () => {
  const directRequests = [];
  const { context } = loadPlugin({
    fetch: async (...args) => {
      directRequests.push(args);
      return {
        ok: true,
        text: async () =>
          'BEGIN:VCALENDAR\nBEGIN:VEVENT\nSUMMARY:Feed event\nDTSTART:20260827T090000\nDTEND:20260827T100000\nEND:VEVENT\nEND:VCALENDAR',
      };
    },
  });
  vm.runInContext(`config.icalUrls="https://calendar.example/feed.ics"`, context);
  await context.fetchAndParseAllCalendars();
  assert.equal(directRequests.length, 1);
});
