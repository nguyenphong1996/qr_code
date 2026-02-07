import BRANCHES_DATA from './branches.data.json';

const ensurePrefixed = (code) => (code && code.startsWith('I') ? code : `I${code}`);

export const BRANCHES = BRANCHES_DATA.map(branch => ({ 
    code: branch.code, 
    prefixed: ensurePrefixed(branch.code),
    name: branch.name,
    address: branch.address
}));
