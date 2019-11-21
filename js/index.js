document.addEventListener('DOMContentLoaded', () => {
    // Fake state
    let m = 7;
    let n = 7;
    let parentPositionLeftSum = null;
    let averages = [];
    let hoverValue = null;
    let deleteRowProccess = false;
    let sumOfRow = null;
    let indexRow = null;

// First data init process
    let data = ((m, n) => {
        let res = [];
        let itemRow = 0;
        for (let i = 0; i < m * n; i++) {
            if (i % n === 0) {
                itemRow++;
            }
            res.push({
                column: Math.floor(i % n) + 1,
                row: itemRow,
                id: i * Math.floor(Math.random() * (2000 - 10)) + 10,
                amount: Math.floor(Math.random() * (999 - 100)) + 100
            });
        }
        return res;
    })(m, n);

// Calculate average values of each column (array)
    let calcAvarages = () => {
        data.map((item) => {
            averages[item.column - 1] = averages[item.column - 1] ? averages[item.column - 1] + item.amount : item.amount;
        });
        averages = averages.map((i) => (i / m).toFixed(1));
    };

// Click to element of table for call incrementing element or delete row
    let addToItem = async (event) => {

        let td = event.target;

        if (!td) return;

        if (deleteRowProccess) {
            let id = event.target.getAttribute("data-id");
            let row = 0;
            m--;
            data.map((item) => {
                if (+item.id === +id) {
                    row = item.row;
                }
            });
            data = data.filter((item) => item.row !== row);
            data = data.map((item) => {
                if (item.row > row) {
                    return {...item, row: item.row - 1}
                } else {
                    return item;
                }
            });
            await clearTable();
            renderTable(m, n);

        } else {
            data = data.map((item) => {
                if (+item.amount === +td.innerHTML && +item.id === +td.dataset.id) {
                    item.amount = item.amount + 1;
                }
                return item;
            });
            await clearTable();
            renderTable(m, n);
        }

    };

// Hover approximate values of elements
    let approximateValues = async (event) => {
        if (+event.target.innerHTML !== +hoverValue) {
            hoverValue = +event.target.innerHTML;
            clearTable();
            renderTable(m, n);
        }
    };

// Add columns to table
    let addColl = (tr, el, i) => {
        let td = document.createElement('td');

        if (sumOfRow && indexRow) {
            if( +indexRow === +el.row){
                td.innerHTML =   `${Math.floor( (+el.amount * 100) / +sumOfRow )} %`;
                td.setAttribute('class', 'persent')
            }else{
                td.innerHTML = el.amount;
            }
        } else {
            td.innerHTML = el.amount;
        }

        if (hoverValue && !deleteRowProccess && !indexRow) {
            let per = (hoverValue / 100) * 20;
            if (el.amount >= (hoverValue - per) && el.amount <= (hoverValue + per)) {
                td.setAttribute('class', 'active');
            }
        }
        td.setAttribute('data-id', el.id);

        td.addEventListener('click', addToItem, false);

        td.addEventListener('mousemove', approximateValues, false);

        tr.appendChild(td);
    };

// Add rows to table
    let addRow = async (tbl, col, step, i) => {
        let tr = document.createElement('tr');
        let rowSum = 0;
        for (let i = 0; i < col; i++) {
            await addColl(tr, data[step], i + 1);
            rowSum += data[step].amount;
            step++;
        }

        await tbl.appendChild(tr);
        let block = document.getElementById('block');
        let span = document.createElement('span');
        let parentPositionTopSum = tr.getBoundingClientRect().top;
        parentPositionLeftSum = parentPositionLeftSum ? parentPositionLeftSum : tr.getBoundingClientRect().left;
        span.innerText = rowSum;
        span.style.position = 'absolute';
        span.style.left = parentPositionLeftSum + (48 * col) + 'px';
        span.style.top = parentPositionTopSum + 15 + 'px';
        span.setAttribute("data-index", i + 1);

        span.addEventListener('mousemove', function (event) {
            sumOfRow = null;
            indexRow = null;
            if (!sumOfRow && !deleteRowProccess) {
                sumOfRow = event.target.innerText;
                indexRow = event.target.getAttribute("data-index");
                let timer = setTimeout(() => {
                    sumOfRow = null;
                    indexRow = null;
                    clearTable();
                    renderTable(m, n);
                    clearTimeout(timer);
                }, 3000)
                clearTable();
                renderTable(m, n);
            }

        }, false);


        block.append(span);

        return step;
    };

// Render  table
    let renderTable = async (row = 9, col = 9) => {

        let block = document.getElementById('block');

        let tbl = document.createElement('table');

        if (deleteRowProccess) {
            tbl.setAttribute("class", "table rounded delete_row_mode");
        } else {
            tbl.setAttribute("class", "table rounded");
        }
        tbl.setAttribute("id", "table");
        block.append(tbl);
        let step = 0;
        for (let i = 0; i < row; i++) {
            step = await addRow(tbl, col, step, i)
        }
        await calcAvarages();
        let x = document.getElementById("table").rows.length;
        let lastRow = document.getElementById("table").rows[x - 1].cells;
        let i = 0;
        for (let td of lastRow) {
            let topTd = td.getBoundingClientRect().top;
            let leftTd = td.getBoundingClientRect().left;
            let span = document.createElement('span');
            span.innerText = averages[i];
            span.style.position = 'absolute';
            span.style.top = topTd + 65 + 'px';
            span.style.left = leftTd + 10 + 'px';
            block.append(span);
            i++;
        }
        ;

        tbl.onmouseleave = () => {
            hoverValue = null;
            clearTable();
            renderTable(m, n);
        }
    };

// Clear table (before render)
    let clearTable = () => {
        let table = document.getElementById('table');
        for (var i = 0, row; row = table.rows[i]; i++) {
            for (var j = 0, col; col = row.cells[j]; j++) {
                row.cells[j].removeEventListener("click", addToItem);
                row.cells[j].removeEventListener("mousemove", approximateValues);
            }
        }

        averages = [];
        parentPositionLeftSum = null;
        for (let i = 0; i < n; i++) {
            const myNode = document.getElementById("block");
            myNode.innerHTML = '';
        }
    };


// For delete row
    document.getElementById('delete-btn').addEventListener('click', (() => {
        alert('Press in row which you want delete ( 10 seconds ) ');
        deleteRowProccess = true;
        clearTable();
        renderTable(m, n);
        setTimeout(() => {
            deleteRowProccess = false;
            clearTable();
            renderTable(m, n);
        }, 10000);
    }), false);

// For add row
    document.getElementById('add-btn').addEventListener('click', ((event) => {
        document.querySelector('.page').style.minHeight = event.target.getBoundingClientRect().top + 200;
        // console.log(event.target.getBoundingClientRect().top);
        m++;
        deleteRowProccess = false;
        let tempArr = [];
        let lastRow = 0;
        let column = 1;
        for (let i = 0; i < m * n; i++) {
            if (typeof data[i] === 'undefined') {
                // does not exist
                tempArr[i] = {
                    column: column,
                    row: lastRow + 1,
                    id: i * Math.floor(Math.random() * (2000 - 10)) + 10,
                    amount: Math.floor(Math.random() * (999 - 100)) + 100
                };
                column++;
            } else {
                // does exist
                tempArr[i] = data[i];
                lastRow = data[i].row;
            }

        }

        data = tempArr;
        clearTable();
        renderTable(m, n);

    }), false);

    renderTable(m, n);
});
