import allOptionContracts from '../data/all_option_contracts.json' with { type: 'json' }

let fields = allOptionContracts.data.fields;

export function filterOptionContracts(stockId, contractType, sMonth) {
    const optionContracts = [];
    for (let i = 0; i < allOptionContracts.data.items.length; i++) {
        let myItem = {};
        let item = allOptionContracts.data.items[i];
        for (let j = 0; j < fields.length; j++) {
            myItem[fields[j]] = item[j];
            let arr = myItem.ts_code.split('.');
            myItem.stockFullId = arr[1].toLowerCase() + arr[0];
        }
        optionContracts.push(myItem);
    }

    let outputList = [];
    for (let i = 0; i < optionContracts.length; i++) {
        const optionContract = optionContracts[i];
        if (optionContract.opt_code.indexOf(stockId) > 0
                && optionContract.name.indexOf(contractType) > 0
                && optionContract.s_month === sMonth) { // 结算月

            outputList.push({
                ...optionContract
            });
        }
    }
    outputList.sort((a, b) => {
        let indexA = a.name.indexOf('月');
        let indexB = b.name.indexOf('月');
        let strikePriceA = a.name.substring(indexA + 1); // 行权价
        let strikePriceB = b.name.substring(indexB + 1); // 行权价
        strikePriceA = Number(strikePriceA);
        strikePriceB = Number(strikePriceB);
        if (strikePriceA > strikePriceB) {
            return 1;
        }
        return -1;
    });

    const outputObjList = [];
    for (let i = 0; i < outputList.length; i++) {
        let contractId = outputList[i].ts_code.replace('.SH', '');
        contractId = contractId.replace('.SZ', '');
        outputObjList.push({
            stockFullId: `option_${contractId}`,
            stockId: contractId,
            stockName: `(${sMonth.substring(0, 4)}) ${outputList[i].name}`
        });
    }

    return outputObjList;
}

export function doFilterOptionContracts(params) {
    let outputObjList;
    let firstData = {
        stockFullId: params.stockFullId,
        stockId: params.stockId,
        stockName: params.stockName,
    };
    outputObjList = filterOptionContracts(params.stockId, params.optionType, params.endMonth);
    outputObjList.unshift(firstData);
    
    console.log(JSON.stringify(outputObjList, null, 4));
    console.log();
}