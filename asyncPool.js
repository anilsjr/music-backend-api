// Simple concurrency limiter for async functions
function asyncPool(poolLimit, array, iteratorFn) {
    let i = 0;
    const ret = [];
    const executing = [];
    const enqueue = function () {
        if (i === array.length) {
            return Promise.resolve();
        }
        const item = array[i++];
        const p = Promise.resolve().then(() => iteratorFn(item, i - 1, array));
        ret.push(p);
        let e = p.then(() => executing.splice(executing.indexOf(e), 1));
        executing.push(e);
        let r = Promise.resolve();
        if (executing.length >= poolLimit) {
            r = Promise.race(executing);
        }
        return r.then(() => enqueue());
    };
    return enqueue().then(() => Promise.all(ret));
}

module.exports = asyncPool;
