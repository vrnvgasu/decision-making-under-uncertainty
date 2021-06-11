'use strict';

const columnsInput = document.getElementById('columns');
const rowsInput = document.getElementById('rows');
const table = document.getElementById('table');
const form = document.getElementById('form');
const alertElement = document.querySelector('.alert');

const maxmaxElement = document.getElementById('maxmax');

let matrix = [];

/** Критерий максимакса */
const maxmin = () => {
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

const prepareResult = () => {
  buildMatrix();
  maxmin();
};

const buildMatrix = () => {
  matrix = [];
  const rows = document.querySelector('.table').rows;
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
};

const rowsInputOnInput = ev => {
  ev.preventDefault();

  renderTable();
};

const checkCells = () => {
  const cells = document.querySelectorAll('.cell');

  let cellsValueStatus = false;
  Array.from(cells).forEach(cell => {
    if (cellsValueStatus) {
      return;
    }

    cellsValueStatus = +cell.value !== 0;
  });

  return cellsValueStatus;
};

const formOnSubmit = ev => {
  ev.preventDefault();

  if (!checkCells()) {
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

/** delete */
renderTable();
