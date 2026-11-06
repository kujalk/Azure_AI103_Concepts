import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { moduleComponents } from './App';
import modules, { moduleById } from './data/modules';
import domains from './data/domains';
import skills from './data/skills';
import questions from './data/questions';
import Home from './pages/Home';
import ExamGuide from './pages/ExamGuide';
import MockExam, { buildExam } from './pages/MockExam';
import { isMulti } from './components/Quiz';

beforeEach(() => {
  window.scrollTo = jest.fn();
  window.localStorage.clear();
});

const inRouter = ui => render(<MemoryRouter>{ui}</MemoryRouter>);

describe('content integrity', () => {
  test('domain weights match the official study guide', () => {
    expect(domains.map(d => d.weight)).toEqual(['25–30%', '30–35%', '10–15%', '10–15%', '10–15%']);
  });

  test('every module has a page and a domain', () => {
    expect(Object.keys(moduleComponents).sort()).toEqual(modules.map(m => m.id).sort());
    modules.forEach(m => expect(domains.some(d => d.id === m.domain)).toBe(true));
  });

  test('every official skill maps to an existing module', () => {
    const items = skills.flatMap(g => g.items);
    expect(items.length).toBe(64); // 16 + 16 + 16 + 8 + 8 bullets in the study guide
    items.forEach(([, id]) => expect(moduleById[id]).toBeDefined());
  });

  test('every module teaches at least one skill', () => {
    const taught = new Set(skills.flatMap(g => g.items).map(([, id]) => id));
    modules.forEach(m => expect(taught.has(m.id)).toBe(true));
  });

  test('every module has at least 6 valid questions', () => {
    modules.forEach(m => {
      const list = questions[m.id];
      expect(list.length).toBeGreaterThanOrEqual(6);
      list.forEach(q => {
        expect(q.options.length).toBeGreaterThanOrEqual(4);
        expect(new Set(q.options).size).toBe(q.options.length);
        expect(q.why.length).toBeGreaterThan(20);
        const answers = isMulti(q) ? q.answer : [q.answer];
        expect(new Set(answers).size).toBe(answers.length);
        answers.forEach(a => {
          expect(Number.isInteger(a)).toBe(true);
          expect(a).toBeGreaterThanOrEqual(0);
          expect(a).toBeLessThan(q.options.length);
        });
      });
    });
  });
});

describe('pages render', () => {
  test.each(modules.map(m => [m.id, m.title]))('%s renders every tab and its quiz', (id, title) => {
    const Page = moduleComponents[id];
    inRouter(<Page />);
    expect(screen.getByRole('heading', { level: 1, name: new RegExp(title.replace(/[&]/g, '.')) })).toBeInTheDocument();
    screen.getAllByRole('tab').forEach(tab => {
      fireEvent.click(tab);
      expect(within(screen.getByRole('tabpanel')).getAllByText(/./).length).toBeGreaterThan(0);
    });
    fireEvent.click(screen.getByRole('tab', { name: 'Quiz' }));
    expect(screen.getAllByTestId('question').length).toBe(questions[id].length);
  });

  test('home lists all modules', () => {
    inRouter(<Home />);
    modules.forEach(m => {
      expect(screen.getAllByRole('link', { name: new RegExp(m.title.replace(/[&]/g, '.')) }).length).toBeGreaterThan(0);
    });
    expect(screen.getByText(/Exam AI-103/)).toBeInTheDocument();
  });

  test('checklist ticks persist', () => {
    const { unmount } = inRouter(<ExamGuide />);
    const first = screen.getAllByRole('checkbox')[0];
    fireEvent.click(first);
    expect(first).toBeChecked();
    unmount();
    inRouter(<ExamGuide />);
    expect(screen.getAllByRole('checkbox')[0]).toBeChecked();
  });
});

describe('quiz behaviour', () => {
  test('answering a question reveals the explanation', () => {
    const Page = moduleComponents.telemetry;
    inRouter(<Page />);
    fireEvent.click(screen.getByRole('tab', { name: 'Quiz' }));
    const q = questions.telemetry[0];
    fireEvent.click(screen.getByRole('button', { name: q.options[q.answer] }));
    expect(screen.getByText(q.why)).toBeInTheDocument();
    expect(screen.getByText(/Correct\./)).toBeInTheDocument();
  });
});

describe('practice exam', () => {
  test('draws close to the requested size, in proportion to domain weights', () => {
    const exam = buildExam(40);
    expect(Math.abs(exam.length - 40)).toBeLessThanOrEqual(2);
    const count = id => exam.filter(q => q.domainId === id).length;
    expect(count('genai')).toBeGreaterThan(count('vision'));
    expect(count('plan')).toBeGreaterThan(count('text'));
  });

  test('has no duplicate questions', () => {
    const exam = buildExam(60);
    expect(new Set(exam.map(q => q.q)).size).toBe(exam.length);
  });

  test('can be completed from start to results', () => {
    inRouter(<MockExam />);
    fireEvent.click(screen.getByRole('button', { name: /20\s*questions/ }));
    for (let guard = 0; guard < 30; guard += 1) {
      const card = screen.getByTestId('question');
      const options = within(card).getAllByRole('button').filter(b => !/Check answer/.test(b.textContent));
      if (within(card).queryByText(/^Choose \d/)) {
        const need = Number(within(card).getByText(/^Choose \d/).textContent.match(/\d/)[0]);
        options.slice(0, need).forEach(b => fireEvent.click(b));
        fireEvent.click(within(card).getByRole('button', { name: 'Check answer' }));
      } else {
        fireEvent.click(options[0]);
      }
      const next = screen.getByRole('button', { name: /Next|See results/ });
      const last = /See results/.test(next.textContent);
      fireEvent.click(next);
      if (last) break;
    }
    expect(screen.getByText(/Your result:/)).toBeInTheDocument();
  });
});
