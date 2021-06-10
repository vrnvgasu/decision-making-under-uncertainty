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

const mixedStrategyElement = document.getElementById('mixed-strategy');
const mixedResultElement = document.getElementById('mixed-result');

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

const getResult = () => {
  buildMatrix();

  let minPrice = getMinPrice();
  let maxPrice = getMaxPrice();

  renderMinAndHirePrices(minPrice, maxPrice);

  if (minPrice.value === maxPrice.value) {
    mixedStrategyElement.classList.add('hidden');
    renderSaddlePoint(minPrice);

    return;
  }

  saddlePointElement.classList.add('hidden');
  mixedStrategyElement.classList.remove('hidden');
  prepareMixedStrategy(minPrice, maxPrice);
};

const prepareMixedStrategy = (minPrice, maxPrice) => {
  mixedStrategyElement.querySelector('.min-price').textContent = minPrice.value;
  mixedStrategyElement.querySelector('.max-price').textContent = maxPrice.value;

  mixedStrategyElement.querySelector('.a-equation').innerHTML = renderAEquations();
  mixedStrategyElement.querySelector('.b-equation').innerHTML = renderBEquations();

  const aResult = binaryMatrixSolution(getVarsByColumns());
  const bResult = binaryMatrixSolution(getVarsByRows());
  renderEquationsResult(aResult, bResult);
  renderMixedResult(aResult, bResult);
};

const getVarsByRows = () => {
  const vars = [];

  for (let i = 0; i < matrix.length; i++) {
    let row = matrix[i];

    for (let j = 0; j < row.length; j++) {
      vars.push(+matrix[i][j]);
    }
  }

  return vars;
};

const getVarsByColumns = () => {
  const vars = [];

  for (let j = 0; j < matrix[0].length; j++) {
    for (let i = 0; i < matrix.length; i++) {
      vars.push(+matrix[i][j]);
    }
  }

  return vars;
};

const binaryMatrixSolution = (vars) => {
  const y = (vars[0] - vars[2]) / (vars[0] - vars[1] - vars[2] + vars[3]);
  const x = 1 - y;
  const z = vars[0] * x + vars[1] * y;

  return {y: y, x: x, z: z};
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

const renderBEquations = () => {
  let equation = '';

  for (let i = 0; i < matrix.length; i++) {
    let row = matrix[i];

    for (let j = 0; j < row.length; j++) {
      equation += `${j===0 ? '<br>' : ' + '}${row[j]}Z${j}${(j+1)===row.length ? ' = V;' : ''}`;
    }
  }

  for (let j = 0; j < matrix[0].length; j++) {
    equation += `${j===0 ? '<br>' : ' + '}Z${j}${(j+1)===matrix[0].length ? ' = 1;' : ''}`;
  }

  return equation;
};

const renderAEquations = () => {
  let equation = '';

  for (let j = 0; j < matrix[0].length; j++) {
    for (let i = 0; i < matrix.length; i++) {
      equation += `${i===0 ? '<br>' : ' + '}${matrix[i][j]}U${i}${(i+1)===matrix.length ? ' = V;' : ''}`;
    }
  }

  for (let i = 0; i < matrix.length; i++) {
    equation += `${i===0 ? '<br>' : ' + '}U${i}${(i+1)===matrix.length ? ' = 1;' : ''}`;
  }

  return equation;
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
  saddlePointElement.querySelector('.price').textContent = `${minPrice.value}`;
  saddlePointElement.querySelector('.first-player-strategy').textContent = minPrice.i;
  saddlePointElement.querySelector('.second-player-strategy').textContent = minPrice.j;
};

const renderMixedResult = (aResult, bResult) => {
  mixedResultElement.innerHTML = `
  <b>Решением игры</b> являются смешанные стратегии
  U=(${aResult.x.toFixed(2)},${aResult.y.toFixed(2)}),
  Z=(${bResult.x.toFixed(2)},${bResult.y.toFixed(2)}),<br>
  а цена игры V=${aResult.z.toFixed(2)}. 
  `;
};

const renderEquationsResult = (aResult, bResult) => {
  mixedStrategyElement.querySelector(`.a-result`).innerHTML = `
    U0=${aResult.x.toFixed(2)};<br>
    U1=${aResult.y.toFixed(2)};<br>
    V=${aResult.z.toFixed(2)};<br>
  `;

  mixedStrategyElement.querySelector(`.b-result`).innerHTML = `
    Z0=${bResult.x.toFixed(2)};<br>
    Z1=${bResult.y.toFixed(2)};<br>
    V=${bResult.z.toFixed(2)};<br>
  `;
};