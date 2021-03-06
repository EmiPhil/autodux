const test = require('tape');
const autodux = require('./');
const id = autodux.id;
const assign = autodux.assign;

const createDux = () => autodux({
  slice: 'counter',
  initial: 0,
  actions: {
    increment: {
      reducer: state => state + 1
    },
    decrement: {
      reducer: state => state - 1
    },
    multiply: {
      create: id,
      reducer: (state, payload) => state * payload
    }
  },
  selectors: {
    getValue: id
  }
});

test('autodux().slice', assert => {
  const msg = 'should have the correct string value';

  const actual = createDux().slice;
  const expected = 'counter';

  assert.same(actual, expected, msg);
  assert.end();
});

test('autodux().actions', assert => {
  const msg = 'should contain action creators';

  const actual = Object.keys(createDux().actions);
  const expected = ['increment', 'decrement', 'multiply'];

  assert.same(actual, expected, msg);
  assert.end();
});

test('autodux().actions', assert => {
  const msg = 'should produce correct action objects';

  const { actions } = createDux();

  const actual = [
    actions.increment(),
    actions.decrement(),
    actions.multiply(2)
  ];

  const expected = [
    { type: 'counter/increment', payload: undefined },
    { type: 'counter/decrement', payload: undefined },
    { type: 'counter/multiply', payload: 2 },
  ];

  assert.same(actual, expected, msg);
  assert.end();
});

test('autodux().actions', assert => {
  const msg = 'should produce namespaced action type constants';

  const {
    actions: {
      increment,
      decrement,
      multiply
    }
  } = createDux();

  const actual = [
    increment.type,
    decrement.type,
    multiply.type
  ];

  const expected = [
    'counter/increment',
    'counter/decrement',
    'counter/multiply'
  ];

  assert.same(actual, expected, msg);
  assert.end();
});

test('autodux().reducer', assert => {
  const msg = 'reducer should switch correctly';

  const {
    actions: {
      increment,
      decrement
    },
    reducer,
    initial
  } = createDux();

  const actions = [
    increment(),
    increment(),
    increment(),
    decrement()
  ];

  const actual = actions.reduce(reducer, initial);
  const expected = 2;

  assert.same(actual, expected, msg);
  assert.end();
});

test('autodux().reducer', assert => {
  const msg = 'reducer should deliver action payloads';

  const {
    actions: {
      increment,
      multiply
    },
    reducer,
    initial
  } = createDux();

  const actions = [
    increment(),
    increment(),
    multiply(2)
  ];

  const actual = actions.reduce(reducer, initial);
  const expected = 4;

  assert.same(actual, expected, msg);
  assert.end();
});

test('autodux().selectors', assert => {
  const msg = 'should return selector that knows its state slice';
  const { getValue } = createDux().selectors;

  const actual = getValue({ counter: 3 });
  const expected = 3;

  assert.same(actual, expected, msg);
  assert.end();
});

test('autodux() action creators', assert => {
  const msg = 'should default missing action creators to identity';

  const value = 'UserName';
  const { actions } = autodux({
    slice: 'emptyCreator',
    actions: {
      nothing: {
        reducer: x => x
      }
    }
  });

  const actual = actions.nothing(value);
  const expected = {
    type: 'emptyCreator/nothing',
    payload: value
  };

  assert.same(actual, expected, msg);
  assert.end();
});

test('autodux() action creators', assert => {
  const msg =
    'should default missing reducer to spread payload into state';

  const { actions, reducer } = autodux({
    slice: 'emptyCreator',
    initial: {c: 'c'},
    actions: {
      nothing: {
        create: () => ({a: 'a', b: 'b'})
      }
    }
  });

  const actual = reducer(undefined, actions.nothing());
  const expected = {
    a: 'a',
    b: 'b',
    c: 'c'
  };

  assert.same(actual, expected, msg);
  assert.end();
});

test('Calling the reducer with no arguments', assert => {
  const msg = 'Should return valid default state';
  const initial = { a: 'a' };
  const { reducer } = autodux({
    initial,
    actions: {
      reducer: x => x
    }
  });
  const actual = reducer();
  const expected = initial;

  assert.same(actual, expected, msg);
  assert.end();
});

test('Passing functions as action values', assert => {
  const msg = 'should use function as reducer';

  const {
    reducer,
    actions: {
      increment,
      decrement,
      multiply
    },
    selectors: {
      getValue
    }
  } = autodux({
    // the slice of state your reducer controls
    slice: 'counter',

    // The initial value of your reducer state
    initial: 0,

    // No need to implement switching logic -- it's
    // done for you.
    actions: {
      increment: state => state + 1,
      decrement: state => state - 1,
      multiply: {
        create: ({ by }) => by,
        reducer: (state, payload) => state * payload
      }
    },

    // No need to select the state slice -- it's done for you.
    selectors: {
      getValue: id
    }
  });

  const state = [
    increment(),
    increment(),
    increment(),
    decrement(),
    multiply({ by: 2 })
  ].reduce(reducer, undefined);
  const actual = getValue({ counter: state });

  const expected = 4;

  assert.same(actual, expected, msg);
  assert.end();
});

test('autodux/assign(key)', assert => {
  const msg =
    'should set the key in the state to the payload value';

  const {
    actions: {
      setUserName,
      setAvatar
    },
    reducer
  } = autodux({
    slice: 'user',
    initial: {
      userName: 'Anonymous',
      avatar: 'anonymous.png'
    },
    actions: {
      setUserName: assign('userName'),
      setAvatar: assign('avatar')
    }
  });
  const userName = 'Foo';
  const avatar = 'foo.png';

  const actual = [
    setUserName(userName),
    setAvatar(avatar)
  ].reduce(reducer, undefined);

  const expected = {
    userName,
    avatar
  };

  assert.same(actual, expected, msg);
  assert.end();
});
