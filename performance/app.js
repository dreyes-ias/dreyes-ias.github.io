/* Copyright 2016 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License. */

(function(window) {
  'use strict';

  var app = {},
      proto = document.querySelector('.proto'),
      movers,
      bodySize = document.body.getBoundingClientRect(),
      ballSize = proto.getBoundingClientRect(),
      MAX_HEIGHT = Math.floor(bodySize.height - ballSize.height),
      MAX_WIDTH = 97, // 100vw - width of square (3vw)
      incrementor = 10,
      DISTANCE = 3,
      frame,
      minimum = 40,
      subtract = document.querySelector('.subtract'),
      add = document.querySelector('.add');

  app.optimize = false;
  app.count = minimum;
  app.enableApp = true;

  app.init = function () {
    var mover,
      top;

    if (movers) {
      bodySize = document.body.getBoundingClientRect();
      for (var i = 0; i < movers.length; i++) {
        document.body.removeChild(movers[i]);
      }
      document.body.appendChild(proto);
      ballSize = proto.getBoundingClientRect();
      document.body.removeChild(proto);
      MAX_HEIGHT = Math.floor(bodySize.height - ballSize.height);
    }

    for (var i = 0; i < app.count; i++) {
      mover = proto.cloneNode();
      top = Math.floor(Math.random() * (MAX_HEIGHT));
      if (top === MAX_HEIGHT) {
        mover.classList.add('up');
      } else {
        mover.classList.add('down');
      }
      mover.style.left = (i / (app.count / MAX_WIDTH)) + 'vw';
      mover.style.top = top + 'px';
      document.body.appendChild(mover);
    }
    movers = document.querySelectorAll('.mover');
  };

  app.setNegativeDirection = function (element) {
    element.classList.remove('up');
    element.classList.add('down');
  }

  app.setPositiveDirection = function (element) {
    element.classList.remove('down');
    element.classList.add('up');
  }

  app.update = function (timestamp) {
    var position, mover;
    for (var i = 0; i < app.count; i++) {
      mover = movers[i];
      if (!app.optimize) { // unoptimized solution
        position = mover.classList.contains('down') ?
            mover.offsetTop + DISTANCE : mover.offsetTop - DISTANCE;
        position = position < 0 ? 0 : position;
        position = position > MAX_HEIGHT ? MAX_HEIGHT : position;
        mover.style.top = position + 'px';
        if (mover.offsetTop === 0) {
          app.setNegativeDirection(mover);
        } else if (mover.offsetTop === MAX_HEIGHT) {
          app.setPositiveDirection(mover);
        }
      } else { // use the optimized solution
        position = parseInt(mover.style.top.slice(0, mover.style.top.indexOf('px')));
        mover.classList.contains('down') ? position += DISTANCE : position -= DISTANCE;
        position = position < 0 ? 0 : position;
        position = position > MAX_HEIGHT ? MAX_HEIGHT : position;
        mover.style.top = position + 'px';
        if (position === 0) {
          app.setNegativeDirection(mover);
        } else if (position === MAX_HEIGHT) {
          app.setPositiveDirection(mover);
        }
      }
    }
    frame = window.requestAnimationFrame(app.update);
  }

  document.querySelector('.stop').addEventListener('click', function (e) {
    if (app.enableApp) {
      cancelAnimationFrame(frame);
      e.target.textContent = 'Start';
      app.enableApp = false;
    } else {
      frame = window.requestAnimationFrame(app.update);
      e.target.textContent = 'Stop';
      app.enableApp = true;
    }
  });

  document.querySelector('.optimize').addEventListener('click', function (e) {
    if (e.target.textContent === 'Optimize') {
      app.optimize = true;
      e.target.textContent = 'Un-Optimize';
    } else {
      app.optimize = false;
      e.target.textContent = 'Optimize';
    }
  });

  add.addEventListener('click', function (e) {
    cancelAnimationFrame(frame);
    app.count += incrementor;
    subtract.disabled = false;
    app.init();
    frame = requestAnimationFrame(app.update);
  });

  subtract.addEventListener('click', function () {
    cancelAnimationFrame(frame);
    app.count -= incrementor;
    app.init();
    frame = requestAnimationFrame(app.update);
    if (app.count === minimum) {
      subtract.disabled = true;
    }
  });

  function debounce(func, wait, immediate) {
    var timeout;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  };

  var onResize = debounce(function () {
    if (app.enableApp) {
        cancelAnimationFrame(frame);
        app.init();
        frame = requestAnimationFrame(app.update);
    }
  }, 500);

  window.addEventListener('resize', onResize);

  add.textContent = 'Add ' + incrementor;
  subtract.textContent = 'Subtract ' + incrementor;
  document.body.removeChild(proto);
  proto.classList.remove('.proto');
  app.init();
  window.app = app;
  frame = window.requestAnimationFrame(app.update);

})(window);
