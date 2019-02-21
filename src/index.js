import AsyncWatch from 'async-watch';

// INIT Game STATE //
const truth = {
  winning: true,
  turn_user: false,
  power_on: false,
  seq_length: 0,
  seq_position: 0,
  computer_seq: [],
  user_seq: [],
  panels: {
    red: document.querySelector('.red'),
    green: document.querySelector('.green'),
    blue: document.querySelector('.blue'),
    yellow: document.querySelector('.yellow'),
    all: document.querySelectorAll('.panel'),
  },
  user_controls: {
    power_switch: document.querySelector('.power-switch'),
    start_reset: document.querySelector('.start_reset'),
    strict: document.querySelector('.strict'),
  },
};
// Create NEW Instance of GAME state //
let game = Object.assign({}, truth);

// Observe Object via ES6 proxy //

const handler = {
  set(target, key, value) {},
};
const stateShift = new Proxy(game, handler);

// Create sequence functions //
const randomNumber = () => Math.floor(Math.random() * 4);
const convertToColor = num => ['R', 'B', 'Y', 'G'][num];
const genSeq = () => {
  let sequence = [];
  for (let i = 0; i < 20; i++) {
    const segment = [convertToColor(randomNumber())];
    sequence =
      i % 2 === 0 ? [...sequence, ...segment] : [...segment, ...sequence];
  }
  return sequence;
};

const updateState = (update, state = game) => {
  game = Object.assign({}, state, ...update);
  console.log(game);
};

// Panel event handler //
const all = game.panels.all,
  red = game.panels.red,
  blue = game.panels.blue,
  green = game.panels.green,
  yellow = game.panels.yellow,
  simon = document.querySelector('.simon'),
  soundHandler = (target) => {
    target.play();
  },
  panelHandler = (e) => {
    if (NodeList.prototype.isPrototypeOf(e) || e[1]) {
      // check for nodelist
      sequencePlayer([...e, ...e, ...e], 200);
    }
    e = e.target ? e.target : e;
    e.classList.add('active');
    soundHandler(document.getElementById(`panel-tone-${e.classList[1]}`));
    setTimeout(() => {
      e.classList.remove('active');
    }, 500);
  };

// TURN ON //
const on_off = document.getElementById('on-off');
const slider = document.querySelector('.switch');

on_off.addEventListener('click', () => {
  slider.classList.toggle('on');
  on_off.innerHTML = on_off.innerHTML === 'ON' ? 'OFF' : 'ON';
  panelHandler(all);
});
simon.addEventListener('mousedown', panelHandler);

const sequencePlayer = (seq, int = 750) => {
  let db = { R: red, G: green, B: blue, Y: yellow },
    index = 0;
  window.interval = setInterval(() => {
    if (index < seq.length) {
      const current = seq[index];
      panelHandler(db[current]);
      index++;
    } else {
      clearInterval(window.interval);
    }
  }, int);
};

document.querySelector('.start-reset').addEventListener('click', () => {
  updateState({
    winning: true,
    seq_length: 1,
    computer_seq: genSec(),
  });
});

// sequencePlayer(['R', 'G', 'B', 'Y', 'R', 'G', 'B', 'Y', 'R', 'G', 'B', 'Y'], 12)

/*

  Change START STOP to Start/Reset
  Only 1 handler for both start and reset functions
  on start reset event - set user counter to 0, and step to 1,
  create handler for user input stage:

  1) counts down from the current seq length to 0
  1b)display countdown in steps display as both user and computer progress
      through their sequences
  2) at each press, check accuracy against computer seq.
  3) wrong press should blink all colors 3 times, while counting down
      3..., 2..., 1... - then playback the same sequence that prompted the
      user error.
  4) reset button changed to STRICT mode - generate random sequence, at a
      random length, allow only one try to properly complete seq - BOTH win
      and loss should trigger next random sequence

*/
