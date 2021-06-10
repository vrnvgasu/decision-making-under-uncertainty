'use strict';

const cells = document.querySelectorAll('.cell');
const rows = document.querySelector('.table').rows;
const alertElement = document.querySelector('.alert');
const form = document.getElementById('form');
const minPriceElement = document.getElementById('min-price');
const minPriceResultElement = document.getElementById('min-price-result');
const maxPriceElement = document.getElementById('max-price');
const maxPriceResultElement = document.getElementById('max-price-result');
const saddlePointElement = document.getElementById('saddle-point');

let matrix = [];

const buildMatrix = () => {
  matrix = [];
  Array.from(rows).forEach(row => {
    let matrixRow = [];
    Array.from(row.cells).forEach(cell => {
      let input = cell.querySelector('.cell');

      if (!input) {
        return;
      }

      matrixRow.push(input.value);
    });

    if (matrixRow.length) {
      matrix.push(matrixRow);
    }
  });
};

const renderMinAndHirePrices = (minPrice, maxPrice) => {
  minPriceElement.classList.remove('hidden');
  maxPriceElement.classList.remove('hidden');

  minPriceResultElement.textContent = minPrice.value;
  maxPriceResultElement.textContent = maxPrice.value;
};

const renderSaddlePoint = (minPrice) => {
  saddlePointElement.classList.remove('hidden');
  saddlePointElement.querySelector('.price-position').textContent = `${minPrice.i}${minPrice.j}`;
  saddlePointElement.querySelector('.first-player-strategy').textContent = minPrice.i;
  saddlePointElement.querySelector('.second-player-strategy').textContent = minPrice.j;
};

const getResult = () => {
  buildMatrix();
  console.log(matrix);

  let minPrice = getMinPrice();
  console.log('minPrice --', minPrice);
  let maxPrice = getMaxPrice();
  console.log('maxPrice --', maxPrice);

  renderMinAndHirePrices(minPrice, maxPrice);

  if (minPrice.value === maxPrice.value) {
    renderSaddlePoint(minPrice);

    return;
  }

  saddlePointElement.classList.add('hidden');
};

const getMaxPrice = () => {
  const maxInColumns = {};

  for (let j = 0; j < matrix[0].length; j++) {
    for (let i = 0; i < matrix.length; i++) {
      if (i === 0) {
        maxInColumns[j] = {
          i: +i + 1,
          j: +j + 1,
          value: +matrix[i][j],
        }

        continue;
      }

      if (maxInColumns[j].value < matrix[i][j]) {
        maxInColumns[j] = {
          i: +i + 1,
          j: +j + 1,
          value: +matrix[i][j],
        }
      }
    }
  }

  let result = maxInColumns[0];

  for (let key in maxInColumns) {
    if (result.value > maxInColumns[key].value) {
      result = maxInColumns[key];
    }
  }

  return result;
};

const getMinPrice = () => {
  const minInRows = {};

  for (let i = 0; i < matrix.length; i++) {
    let row = matrix[i];

    for (let j = 0; j < row.length; j++) {
      if (j === 0) {
        minInRows[i] = {
          i: +i + 1,
          j: +j + 1,
          value: +row[j],
        }

        continue;
      }

      if (minInRows[i].value > row[j]) {
        minInRows[i] = {
          i: +i + 1,
          j: +j + 1,
          value: +row[j],
        }
      }
    }
  }

  let result = minInRows[0];

  for (let key in minInRows) {
    if (result.value < minInRows[key].value) {
      result = minInRows[key];
    }
  }

  return result;
};

const formOnSubmit = (ev) => {
  ev.preventDefault();

  let cellsValueStatus = false;
  Array.from(cells).forEach(cell => {
    if (cellsValueStatus) {
      return;
    }

    cellsValueStatus = +cell.value !== 0;
  });

  if (!cellsValueStatus) {
    alertElement.style.display = 'block';

    return;
  }

  alertElement.style.display = 'none';

  getResult();
};

form.addEventListener('submit', formOnSubmit);
