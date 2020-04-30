'use strict';

/**
 * Сделано задание на звездочку.
 * Реализована остановка промиса по таймауту.
 */
const isStar = true;

/**
 * Функция паралелльно запускает указанное число промисов
 *
 * @param {Function<Promise>[]} jobs – функции, которые возвращают промисы
 * @param {Number} parallelNum - число одновременно исполняющихся промисов
 * @param {Number} timeout - таймаут работы промиса
 * @returns {Promise<Array>}
 */
function runParallel(jobs, parallelNum, timeout = 1000) {
    return new Promise((resolve) => {
        const countOfJobs = jobs.length;
        if (countOfJobs === 0) {
            return resolve([]);
        }
        let jobIndex = 0;
        // Ставим на выполнение параллельно parallelNum задач
        while (parallelNum > 0 && jobIndex < countOfJobs) {
            runPromiseWithTimeout(
                jobs,
                jobIndex++,
                timeout,
                addResponseOfPromise
            );
            parallelNum--;
        }
        const result = [];
        function addResponseOfPromise(pushedIndex, response) {
            // Важно именно такое добавление response, т.к. push(...) не сохранит порядок
            result[pushedIndex] = response;
            if (result.length === countOfJobs) {
                return resolve(result);
            } else if (jobIndex < countOfJobs) {
                // Если попали сюда, значит выполняются уже < parallelNum задач и запустим ещё одну
                runPromiseWithTimeout(
                    jobs,
                    jobIndex++,
                    timeout,
                    addResponseOfPromise
                );
            }
        }

    });
}

/**
 * Вызов промиса с указанным timeout спустя который,
 * если промис не завершился, возвращается ошибка Promise timeout
 * @param{Array} jobs
 * @param{Number} jobIndex
 * @param{Number} timeout
 * @param{Function} appliedFunction
 */
function runPromiseWithTimeout(jobs, jobIndex, timeout, appliedFunction) {
    applyForFirstResolved(
        jobs[jobIndex](),
        getTimeoutPromise(timeout),
        appliedFunction.bind(null, jobIndex)
    );
}

/**
 * Применяет функцию к первому из двух промисов, который перешел в resolved states
 * @param{Promise} firstPromise
 * @param{Promise} secondPromise
 * @param{Function} appliedFunction
 */
function applyForFirstResolved(firstPromise, secondPromise, appliedFunction) {
    Promise.race([firstPromise, secondPromise])
        .then(response => appliedFunction(response))
        .catch(error => appliedFunction(error));
}

/**
 * Промис, который спит указанное время
 * @param{Number} timeout - время спячки
 * @returns {Promise<void>}
 */
async function getTimeoutPromise(timeout) {
    await new Promise((resolve, reject) => {
        return setTimeout(reject, timeout, new Error('Promise timeout'));
    });
}

module.exports = {
    runParallel,
    isStar
};
