import { exec } from 'child-process-promise'

export default async function({ url }) {
    return exec(`bash scripts/evaluator.sh ${url}`);
}
