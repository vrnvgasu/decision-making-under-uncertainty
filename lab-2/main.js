'use strict';

const columnsInput = document.getElementById('columns');
const rowsInput = document.getElementById('rows');
const table = document.getElementById('table');
const form = document.getElementById('form');
const alertElement = document.querySelector('.alert');

const hurwitzRate1Element = document.getElementById('hurwitzRate1');
const hurwitzRate2Element = document.getElementById('hurwitzRate2');
const bayesianTable = document.getElementById('bayesian-table');

const maxmaxElement = document.getElementById('maxmax');
const waldElement = document.getElementById('wald');
const savageElement = document.getElementById('savage');
const hurwitzElement = document.getElementById('hurwitz');
const bayesianElement = document.getElementById('bayesian');
const laplaceElement = document.getElementById('laplace');

let matrix = [];

/** Критерий Лапласа */
const laplace = () => {
  const average = (1 / columnsInput.value).toFixed(2);
  const probabilities = [];

  for (let i = 0; i < columnsInput.value; i++) {
    probabilities.push(average);
  }

  const results = [];
  matrix.forEach(row => {
    let sum = 0;

    for (let j = 0; j < row.length; j++) {
      sum += (row[j] * probabilities[j]);
    }

    results.push(sum);
  });

  const strategy = getMaxItemAndPositionFromArray(results);

  laplaceElement.querySelector('.description').innerHTML = `
    L=max{${results.toString()}}=${strategy[0]}, что соответствует стратегии A${strategy[1] + 1}
  `;
};

/** Критерий Байеса */
const bayesian = () => {
  const probabilities = Array.from(bayesianTable.querySelectorAll('.cell'))
    .map(cell => cell.value);
  const results = [];
  matrix.forEach(row => {
    let sum = 0;

    for (let j = 0; j < row.length; j++) {
      sum += (row[j] * probabilities[j]);
    }

    results.push(sum);
  });

  const strategy = getMaxItemAndPositionFromArray(results);

  bayesianElement.querySelector('.description').innerHTML = `
    B=max{${results.toString()}}=${strategy[0]}, что соответствует стратегии A${strategy[1] + 1}
  `;
};

/** Критерий Гурвица */
const hurwitz = () => {
  const minAndMaxItems = [];
  matrix.forEach(row => {
    let items = [];
    items.push(Math.min(...row));
    items.push(Math.max(...row));
    minAndMaxItems.push(items);
  });
  const results1 = [];
  minAndMaxItems.forEach(row => {
    let g = hurwitzRate1Element.value * row[0] + (1 - hurwitzRate1Element.value) * row[1];
    results1.push(g);
  });
  const results2 = [];
  minAndMaxItems.forEach(row => {
    let g = hurwitzRate2Element.value * row[0] + (1 - hurwitzRate2Element.value) * row[1];
    results2.push(g);
  });

  let strategy1 = getMaxItemAndPositionFromArray(results1);
  let strategy2 = getMaxItemAndPositionFromArray(results2);

  hurwitzElement.querySelector('.description').innerHTML = `
    При λ = ${hurwitzRate1Element.value}<br>
    G=max{${results1.toString()}}=${strategy1[0]}, что соответствует стратегии A${strategy1[1] + 1}<br>
    При λ = ${hurwitzRate1Element.value}<br>
    G=max{${results2.toString()}}=${strategy2[0]}, что соответствует стратегии A${strategy2[1] + 1}<br>    
  `;
};

const getMaxItemAndPositionFromArray = array => {
  let maxItemPosition = 0;
  let maxItem = array[0];
  array.forEach((item, i) => {
    if (maxItem < item) {
      maxItem = item;
      maxItemPosition = i;
    }
  });

  return [maxItem, maxItemPosition];
};

/** Матрица рисков */
const getRiskMatrix = () => {
  const riskMatrix = [];

  for (let i = 0; i < matrix.length; i++) {
    riskMatrix.push(matrix[i].slice(0));
  }

  for (let j = 0; j < matrix[0].length; j++) {
    let maxColumnItem = null;

    for (let i = 0; i < matrix.length; i++) {
      if (maxColumnItem === null || maxColumnItem < matrix[i][j]) {
        maxColumnItem = matrix[i][j];
      }
    }

    for (let i = 0; i < matrix.length; i++) {
      riskMatrix[i][j] = maxColumnItem - matrix[i][j];
    }
  }

  return riskMatrix;
};

/** Критерий максимакса */
const maxmax = () => {
  const maxItems = [];
  matrix.forEach(row => maxItems.push(Math.max(...row)));

  let maxItemPosition = 0;
  let maxItem = maxItems[0];
  maxItems.forEach((item, i) => {
    if (maxItem < item) {
      maxItem = item;
      maxItemPosition = i;
    }
  });

  maxmaxElement.querySelector('.description').innerHTML = `
    M=max{${maxItems.toString()}}=${maxItem}, что соответствует стратегии A${maxItemPosition + 1}
  `;
};

/** Критерий Вальда */
const wald = () => {
  const minItems = [];
  matrix.forEach(row => minItems.push(Math.min(...row)));

  let maxItemPosition = 0;
  let maxItem = minItems[0];
  minItems.forEach((item, i) => {
    if (maxItem < item) {
      maxItem = item;
      maxItemPosition = i;
    }
  });

  waldElement.querySelector('.description').innerHTML = `
    W=max{${minItems.toString()}}=${maxItem}, что соответствует стратегии A${maxItemPosition + 1}
  `;
};

/** Критерий Сэвиджа */
const savage = () => {
  const maxItems = [];
  const riskMatrix = getRiskMatrix();
  riskMatrix.forEach(row => maxItems.push(Math.max(...row)));

  let minItemPosition = 0;
  let minItem = maxItems[0];
  maxItems.forEach((item, i) => {
    if (minItem > item) {
      minItem = item;
      minItemPosition = i;
    }
  });

  let riskRows = '';
  riskMatrix.forEach(row => {
    riskRows += '<tr>';
    row.forEach(cell => {
      riskRows += '<td>' + cell + '</td>';
    });
    riskRows += '</tr>';
  });
  savageElement.querySelector('.description').innerHTML = `
    <h4>Матрица риска</h4>
    <table class="table">${riskRows}</table>
    S=min{${maxItems.toString()}}=${minItem}, что соответствует стратегии A${minItemPosition + 1}
  `;
};

const prepareResult = () => {
  buildMatrix();
  maxmax();
  wald();
  savage();
  hurwitz();
  bayesian();
  laplace();
};

const buildMatrix = () => {
  matrix = [];
  const rows = table.rows;
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

const columnsInputOnInput = ev => {
  ev.preventDefault();

  renderTable();
  renderBayesianTable();
};

const rowsInputOnInput = ev => {
  ev.preventDefault();

  renderTable();
};

const checkCells = () => {
  const cells = table.querySelectorAll('.cell');

  let cellsValueStatus = false;
  Array.from(cells).forEach(cell => {
    if (cellsValueStatus) {
      return;
    }

    cellsValueStatus = +cell.value !== 0;
  });

  return cellsValueStatus;
};

const checkHurwitzRates = () => {
  if (!(parseFloat(hurwitzRate1Element.value) >= 0 && parseFloat(hurwitzRate1Element.value) <= 1)) {
    return false;
  }
  if (!(parseFloat(hurwitzRate2Element.value) >= 0 && parseFloat(hurwitzRate2Element.value) <= 1)) {
    return false;
  }

  return true;
};

const checkBayesianProbability = () => {
  const cells = bayesianTable.querySelectorAll('.cell');

  if (cells.length < 2) {
    return false;
  }

  for (let cell of cells) {
    if (!(parseFloat(cell.value) > 0 && parseFloat(cell.value) < 1)) {
      return false;
    }
  }

  return true;
}

const formOnSubmit = ev => {
  ev.preventDefault();

  if (!checkCells() || !checkHurwitzRates() || !checkBayesianProbability()) {
    alertElement.style.display = 'block';

    return;
  }

  alertElement.style.display = 'none';

  prepareResult();
}
columnsInput.addEventListener('input', columnsInputOnInput);
rowsInput.addEventListener('input', rowsInputOnInput);
form.addEventListener('submit', formOnSubmit);

const renderTable = () => {
  table.innerHTML = '';

  if (columnsInput.value < 2 || rowsInput.value < 2) {
    return;
  }

  const columnsNumber = columnsInput.value;
  const rowsNumber = rowsInput.value;

  renderTableHeader(columnsNumber);
  renderRows(columnsNumber, rowsNumber);
};

const renderRows = (columnsNumber, rowsNumber) => {
  for (let i = 0; i < rowsNumber; i++) {
    const tr = document.createElement('tr');
    let innerHtml = `<td>A${i+1}</td>`;

    for (let j = 1; j <= columnsNumber; j++) {
      innerHtml += `<td><label><input class="cell" type="number" required></label></td>`;
    }

    tr.innerHTML = innerHtml;
    table.append(tr);
  }
};

const renderTableHeader = columnsNumber => {
  const tr = document.createElement('tr');
  let innerHtml = '<td></td>';

  for (let j = 0; j < columnsNumber; j++) {
    innerHtml += `<td>B${j+1}</td>`;
  }

  tr.innerHTML = innerHtml;
  table.append(tr);
};

const renderBayesianTable = () => {
  if (columnsInput.value < 2) {
    return;
  }

  let innerHTML = '<tr>';

  for (let j = 1; j <= columnsInput.value; j++) {
    innerHTML += `<td>P${j} (0,1)</td>`;
  }

  innerHTML += '</tr>';

  const average = (1 / columnsInput.value).toFixed(2);

  for (let j = 1; j <= columnsInput.value; j++) {
    innerHTML += `<td><label><input class="cell" type="text" value="${average}" required></label></td>`;
  }

  innerHTML += '</tr>';

  bayesianTable.innerHTML = innerHTML;
};

renderTable();
renderBayesianTable();
