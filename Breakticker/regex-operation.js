const regexOperation = (valueSwitch, cellValue) => {
    for (let i of Object.keys(valueSwitch)) {
        if (cellValue.match(i)) {
            document.getElementById(valueSwitch[i]).style.display = '';
        }
        else {
            document.getElementById(valueSwitch[i]).style.display = 'none';
        }
    }
}