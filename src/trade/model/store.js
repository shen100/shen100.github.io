let investedStocks = [];

function init() {
    investedStocks = JSON.parse(localStorage.getItem('investedStocks') || '[]');
}

init();

export default {
    investedStocks
}