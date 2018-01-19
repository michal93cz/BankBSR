export let isValid = (number: string): boolean => {
    number = number + "2521";
    const sk = number.substr(0, 2);
    number = (number + number.substring(0, 1)).slice(2, number.length);

    console.log(number + sk);
    console.log(parseInt(number + sk) % 97);

    return parseInt(number + sk) % 97 == 1 ? true : false;
};

export let generate = (number: string, cb: (done: string) => any): void => {
    let i, j, sum;
    let res: string;
    const pad = "0000000000000000";
    number = (pad + number).slice(-pad.length);

    const weights = [
        1, 10, 3, 30, 9, 90, 27, 76, 81, 34, 49, 5, 50, 15, 53, 45, 62,
        38, 89, 17, 73, 51, 25, 56, 75, 71, 31, 19, 93, 57, 85, 74, 61, 28
    ];

    const numberToOperation = process.env.BANK_NUMBER + number + "252100";
    i = numberToOperation.length - 1;
    j = 0;
    sum = 0;
    while (i >= 0) {
        sum = sum + (parseInt( "" + numberToOperation.charAt(i) ) * weights[j] );
        i = i - 1;
        j = j + 1;
    }

    sum = sum % 97;
    sum = 98 - sum;
    res = "" + sum;
    if (res.length < 2) res = "0" + res;

    cb(res + process.env.BANK_NUMBER + number);
};
